/**
 * WebGPU initialization and setup
 * Includes iOS Safari compatibility checks
 */

export interface WebGPUContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  canvas: HTMLCanvasElement;
}

export async function initWebGPU(canvas: HTMLCanvasElement): Promise<WebGPUContext> {
  // Check WebGPU support
  if (!navigator.gpu) {
    throw new Error(
      'WebGPU is not supported in this browser. ' +
      'On iOS, WebGPU requires iOS 16.4+ with Safari. ' +
      'Make sure you have enabled WebGPU in Settings > Safari > Advanced > Feature Flags.'
    );
  }

  // Request adapter
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance',
  });

  if (!adapter) {
    throw new Error('Failed to get WebGPU adapter');
  }

  // Request device
  const device = await adapter.requestDevice();

  // Configure canvas context
  const context = canvas.getContext('webgpu');
  if (!context) {
    throw new Error('Failed to get WebGPU context from canvas');
  }

  const format = navigator.gpu.getPreferredCanvasFormat();
  
  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });

  return { device, context, format, canvas };
}

export function resizeCanvas(canvas: HTMLCanvasElement): void {
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
}
