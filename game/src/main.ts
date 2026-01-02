// Minimal WebGPU setup
export {};

import QRCode from 'qrcode';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

if (!canvas) {
  throw new Error('Canvas not found');
}

// Set canvas size based on viewport
function resizeCanvas() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Mobile: use full viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    // Desktop: fixed size
    canvas.width = 800;
    canvas.height = 600;
  }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Check WebGPU support
if (!navigator.gpu) {
  document.body.innerHTML = '<div style="color:white;text-align:center;padding:50px;">WebGPU not supported. Use Chrome 113+ or Safari 18+</div>';
  throw new Error('WebGPU not supported');
}

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error('No adapter');

const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu') as GPUCanvasContext;
const format = navigator.gpu.getPreferredCanvasFormat();

context.configure({ device, format });

// Shader with vertex colors and ambient lighting for 3D pyramid
const shaderCode = `
struct Uniforms {
  transform: mat4x4<f32>,
  rotation: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  // Rotate torus around Y axis
  let c = cos(uniforms.rotation);
  let s = sin(uniforms.rotation);
  let rotatedPos = vec3f(
    input.position.x * c - input.position.z * s,
    input.position.y,
    input.position.x * s + input.position.z * c
  );
  let rotatedNormal = vec3f(
    input.normal.x * c - input.normal.z * s,
    input.normal.y,
    input.normal.x * s + input.normal.z * c
  );
  
  // Move torus back from camera
  let worldPos = rotatedPos + vec3f(0.0, 0.0, -4.5);
  
  var output: VertexOutput;
  output.position = uniforms.transform * vec4f(worldPos, 1.0);
  output.worldPos = worldPos;
  output.normal = normalize(rotatedNormal);
  output.uv = input.uv;
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  // Seamlessly tiling pattern using UV coordinates
  let u = input.uv.x * 6.28318; // Convert to 0-2π for seamless tiling
  let v = input.uv.y * 6.28318;
  
  // Create multiple layered patterns that tile seamlessly
  let pattern1 = sin(u * 3.0) * cos(v * 3.0);
  let pattern2 = sin(u * 2.0 + v * 2.0);
  let pattern3 = cos(u * 4.0) * sin(v * 2.0);
  let pattern4 = sin(u * 5.0) * sin(v * 5.0);
  
  // Combine patterns
  let combined = (pattern1 + pattern2 + pattern3 + pattern4) / 4.0;
  let value = (combined + 1.0) * 0.5; // Normalize to 0-1
  
  // Map to colors with smooth gradients
  var baseColor = vec3f(0.0, 0.0, 0.0);
  if (value < 0.25) {
    baseColor = mix(vec3f(0.1, 0.2, 0.6), vec3f(0.2, 0.5, 0.9), value / 0.25);
  } else if (value < 0.5) {
    baseColor = mix(vec3f(0.2, 0.5, 0.9), vec3f(0.3, 0.8, 0.5), (value - 0.25) / 0.25);
  } else if (value < 0.75) {
    baseColor = mix(vec3f(0.3, 0.8, 0.5), vec3f(0.9, 0.7, 0.2), (value - 0.5) / 0.25);
  } else {
    baseColor = mix(vec3f(0.9, 0.7, 0.2), vec3f(0.9, 0.3, 0.5), (value - 0.75) / 0.25);
  }
  
  // Lighting setup
  let lightPos = vec3f(2.0, 3.0, -1.0); // Light position in world space
  let lightColor = vec3f(1.0, 1.0, 0.95); // Slightly warm white
  let ambientStrength = 0.3;
  let specularStrength = 0.5;
  
  // Ambient lighting
  let ambient = ambientStrength * lightColor;
  
  // Diffuse lighting
  let lightDir = normalize(lightPos - input.worldPos);
  let diff = max(dot(input.normal, lightDir), 0.0);
  let diffuse = diff * lightColor;
  
  // Specular lighting (Blinn-Phong)
  let viewDir = normalize(vec3f(0.0, 0.0, 0.0) - input.worldPos); // Camera at origin
  let halfDir = normalize(lightDir + viewDir);
  let spec = pow(max(dot(input.normal, halfDir), 0.0), 32.0);
  let specular = specularStrength * spec * lightColor;
  
  // Combine lighting
  let lighting = ambient + diffuse + specular;
  let finalColor = baseColor * lighting;
  
  return vec4f(finalColor, 1.0);
}
`;

const shaderModule = device.createShaderModule({ code: shaderCode });

// Generate torus geometry
function generateTorus(majorRadius: number, minorRadius: number, majorSegments: number, minorSegments: number) {
  const vertices: number[] = [];
  
  for (let i = 0; i <= majorSegments; i++) {
    const u = (i / majorSegments) * Math.PI * 2;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    
    for (let j = 0; j <= minorSegments; j++) {
      const v = (j / minorSegments) * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      
      // Position
      const x = (majorRadius + minorRadius * cosV) * cosU;
      const y = (majorRadius + minorRadius * cosV) * sinU;
      const z = minorRadius * sinV;
      
      // Normal
      const nx = cosV * cosU;
      const ny = cosV * sinU;
      const nz = sinV;
      
      // UV coordinates for texture
      const uCoord = i / majorSegments;
      const vCoord = j / minorSegments;
      
      vertices.push(x, y, z, nx, ny, nz, uCoord, vCoord);
    }
  }
  
  const indices: number[] = [];
  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const a = i * (minorSegments + 1) + j;
      const b = a + minorSegments + 1;
      
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }
  
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
}

const torus = generateTorus(1.0, 0.4, 316, 158);

// Create vertex buffer
const vertexBuffer = device.createBuffer({
  size: torus.vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(vertexBuffer, 0, torus.vertices);

// Create index buffer
const indexBuffer = device.createBuffer({
  size: torus.indices.byteLength,
  usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(indexBuffer, 0, torus.indices);

// Create uniform buffer for transform matrix
const uniformBuffer = device.createBuffer({
  size: 80, // 4x4 matrix (64 bytes) + 1 float (4 bytes) + padding (12 bytes)
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

// Perspective projection matrix
function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fov / 2);
  const rangeInv = 1.0 / (near - far);
  
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, far * rangeInv, -1,
    0, 0, near * far * rangeInv, 0,
  ]);
}

// Create bind group layout
const bindGroupLayout = device.createBindGroupLayout({
  entries: [{
    binding: 0,
    visibility: GPUShaderStage.VERTEX,
    buffer: { type: 'uniform' },
  }],
});

// Create bind group
const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [{
    binding: 0,
    resource: { buffer: uniformBuffer },
  }],
});

const pipeline = device.createRenderPipeline({
  layout: device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  }),
  vertex: {
    module: shaderModule,
    entryPoint: 'vertexMain',
    buffers: [{
      arrayStride: 32, // 8 floats * 4 bytes: position(3) + normal(3) + uv(2)
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x3' },  // position
        { shaderLocation: 1, offset: 12, format: 'float32x3' }, // normal
        { shaderLocation: 2, offset: 24, format: 'float32x2' }, // uv
      ],
    }],
  },
  fragment: {
    module: shaderModule,
    entryPoint: 'fragmentMain',
    targets: [{ format }],
  },
  primitive: {
    topology: 'triangle-list',
    cullMode: 'back',
  },
  depthStencil: {
    depthWriteEnabled: true,
    depthCompare: 'less',
    format: 'depth24plus',
  },
  multisample: {
    count: 4,
  },
});

// Create depth texture for proper 3D rendering
const depthTexture = device.createTexture({
  size: [canvas.width, canvas.height],
  format: 'depth24plus',
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
  sampleCount: 4,
});

// Create multisample texture for anti-aliasing
const msaaTexture = device.createTexture({
  size: [canvas.width, canvas.height],
  format,
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
  sampleCount: 4,
});

// Stats tracking
const fpsElement = document.getElementById('fps')!;
const trianglesElement = document.getElementById('triangles')!;
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

// Display triangle count
trianglesElement.textContent = (torus.indices.length / 3).toLocaleString();

function render() {
  // Calculate FPS
  frameCount++;
  const currentTime = performance.now();
  const deltaTime = currentTime - lastTime;
  
  if (deltaTime >= 1000) { // Update FPS every second
    fps = Math.round((frameCount * 1000) / deltaTime);
    fpsElement.textContent = fps.toString();
    frameCount = 0;
    lastTime = currentTime;
  }
  
  // Animated rotation
  const time = performance.now() * 0.001;
  const angle = time * 0.5;
  
  // Perspective projection only
  const fov = Math.PI / 3; // 60 degrees
  const aspect = canvas.width / canvas.height;
  const proj = perspective(fov, aspect, 0.1, 10.0);
  
  // Write projection matrix (64 bytes) and rotation angle (4 bytes)
  device.queue.writeBuffer(uniformBuffer, 0, proj.buffer, proj.byteOffset, proj.byteLength);
  device.queue.writeBuffer(uniformBuffer, 64, new Float32Array([angle]));
  
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: msaaTexture.createView(),
      resolveTarget: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      clearValue: { r: 0.2, g: 0.2, b: 0.3, a: 1 },
      storeOp: 'store',
    }],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    },
  });

  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.setIndexBuffer(indexBuffer, 'uint16');
  pass.drawIndexed(torus.indices.length);
  
  pass.end();

  device.queue.submit([encoder.finish()]);
  requestAnimationFrame(render);
}

render();
console.log('WebGPU rendering!');

// Generate QR code for the current dev server URL
const qrCanvas = document.getElementById('qr-code') as HTMLCanvasElement;
const qrContainer = document.getElementById('qr-container') as HTMLDivElement;

if (qrCanvas && qrContainer) {
  // Use current URL so it points to the codespace dev server
  const pageUrl = window.location.href;
  
  QRCode.toCanvas(qrCanvas, pageUrl, {
    width: 150,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
  .then(() => {
    qrContainer.classList.add('visible');
    console.log('QR code generated for:', pageUrl);
  })
  .catch((err: Error) => {
    console.error('Failed to generate QR code:', err);
  });
}
