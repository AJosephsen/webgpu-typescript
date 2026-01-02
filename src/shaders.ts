/**
 * Shader utilities for WebGPU
 */

export const vertexShader = /* wgsl */ `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@vertex
fn vertexMain(@location(0) position: vec2f, @location(1) color: vec4f) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4f(position, 0.0, 1.0);
  output.color = color;
  return output;
}
`;

export const fragmentShader = /* wgsl */ `
@fragment
fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
  return color;
}
`;

export function createShaderModule(device: GPUDevice, code: string): GPUShaderModule {
  return device.createShaderModule({ code });
}

export function createRenderPipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
  vertexShaderModule: GPUShaderModule,
  fragmentShaderModule: GPUShaderModule
): GPURenderPipeline {
  return device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: vertexShaderModule,
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 24, // 2 floats (position) + 4 floats (color) = 6 floats * 4 bytes
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            },
            {
              shaderLocation: 1,
              offset: 8,
              format: 'float32x4',
            },
          ],
        },
      ],
    },
    fragment: {
      module: fragmentShaderModule,
      entryPoint: 'fragmentMain',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });
}
