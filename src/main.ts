/**
 * Main entry point for WebGPU game experiment
 * Initializes WebGPU, sets up game loop, and handles rendering
 */

import { initWebGPU, resizeCanvas } from './webgpu';
import { vertexShader, fragmentShader, createShaderModule, createRenderPipeline } from './shaders';
import { ParticleSystem } from './game';
import { InputHandler } from './input';

class Game {
  private canvas: HTMLCanvasElement;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private pipeline!: GPURenderPipeline;
  private vertexBuffer!: GPUBuffer;
  private particleSystem: ParticleSystem;
  private inputHandler: InputHandler;
  
  private lastTime = 0;
  private frameCount = 0;
  private fps = 0;
  private fpsUpdateTime = 0;

  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.particleSystem = new ParticleSystem(50);
    this.inputHandler = new InputHandler(this.canvas);
  }

  async init(): Promise<void> {
    try {
      // Initialize WebGPU
      const { device, context, format } = await initWebGPU(this.canvas);
      this.device = device;
      this.context = context;

      // Setup canvas size
      resizeCanvas(this.canvas);
      window.addEventListener('resize', () => {
        resizeCanvas(this.canvas);
        this.context.configure({
          device: this.device,
          format,
          alphaMode: 'premultiplied',
        });
      });

      // Create shaders
      const vertexShaderModule = createShaderModule(device, vertexShader);
      const fragmentShaderModule = createShaderModule(device, fragmentShader);

      // Create pipeline
      this.pipeline = createRenderPipeline(device, format, vertexShaderModule, fragmentShaderModule);

      // Create vertex buffer (will be updated each frame)
      this.vertexBuffer = device.createBuffer({
        size: 100 * 6 * 6 * 4, // max particles * 6 vertices * 6 floats * 4 bytes
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });

      console.log('WebGPU initialized successfully');
      this.showInfo('WebGPU initialized!');
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private showError(message: string): void {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.add('visible');
    }
    console.error(message);
  }

  private showInfo(message: string): void {
    console.log(message);
  }

  private updateUI(): void {
    const fpsElement = document.getElementById('fps');
    const touchesElement = document.getElementById('touches');
    
    if (fpsElement) {
      fpsElement.textContent = `FPS: ${this.fps}`;
    }
    
    if (touchesElement) {
      touchesElement.textContent = `Touches: ${this.inputHandler.getTouchCount()}`;
    }
  }

  private update(time: number): void {
    const deltaTime = this.lastTime ? time - this.lastTime : 16;
    this.lastTime = time;

    // Update FPS counter
    this.frameCount++;
    if (time - this.fpsUpdateTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (time - this.fpsUpdateTime));
      this.frameCount = 0;
      this.fpsUpdateTime = time;
      this.updateUI();
    }

    // Update game logic
    const touches = this.inputHandler.getTouches();
    this.particleSystem.setAttractors(touches);
    
    // Add particles on touch (throttled)
    if (touches.length > 0 && Math.random() < 0.1) {
      const touch = touches[Math.floor(Math.random() * touches.length)];
      this.particleSystem.addParticle(touch.x, touch.y);
    }
    
    this.particleSystem.update(deltaTime);
  }

  private render(): void {
    // Get vertex data from particle system
    const vertexData = this.particleSystem.getVertexData();
    
    // Update vertex buffer
    this.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData.buffer, vertexData.byteOffset, vertexData.byteLength);

    // Get current texture
    const textureView = this.context.getCurrentTexture().createView();

    // Create command encoder
    const commandEncoder = this.device.createCommandEncoder();

    // Create render pass
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });

    // Draw particles
    renderPass.setPipeline(this.pipeline);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.draw(this.particleSystem.getParticleCount() * 6, 1, 0, 0);
    renderPass.end();

    // Submit commands
    this.device.queue.submit([commandEncoder.finish()]);
  }

  private gameLoop = (time: number): void => {
    this.update(time);
    this.render();
    requestAnimationFrame(this.gameLoop);
  };

  start(): void {
    console.log('Starting game loop');
    requestAnimationFrame(this.gameLoop);
  }
}

// Initialize and start the game
async function main() {
  const game = new Game();
  
  try {
    await game.init();
    game.start();
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

main();
