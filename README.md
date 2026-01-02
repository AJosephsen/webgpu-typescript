# WebGPU TypeScript Game Experiments

Small game experiments using WebGPU and TypeScript, primarily targeting iOS Safari.

## Overview

This project demonstrates a simple particle system game built with WebGPU and TypeScript. The particles respond to touch input and bounce around the screen, creating an interactive visual experience optimized for mobile devices.

## Features

- ✨ **WebGPU Rendering** - Hardware-accelerated graphics using WebGPU API
- 🎮 **Interactive Particle System** - Touch-responsive particles with physics
- 📱 **iOS Safari Optimized** - Specifically designed for mobile Safari on iOS 16.4+
- 🎨 **Colorful Particles** - Each particle has randomized colors
- 👆 **Multi-touch Support** - Handle multiple simultaneous touch points
- 🖱️ **Mouse Support** - Works on desktop browsers for development

## Requirements

### iOS Safari
- **iOS 16.4 or later** with Safari
- WebGPU must be enabled in Safari settings:
  - Go to Settings > Safari > Advanced > Feature Flags
  - Enable "WebGPU" flag

### Desktop (for development)
- Chrome 113+ or Edge 113+ with WebGPU support
- Safari Technology Preview on macOS

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The development server will start at `http://localhost:3000`. You can also access it from your mobile device on the same network using your computer's IP address.

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

### Type Checking

```bash
# Run TypeScript type checker
npm run typecheck
```

## Project Structure

```
webgpu-typescript/
├── src/
│   ├── main.ts         # Main entry point and game loop
│   ├── webgpu.ts       # WebGPU initialization and setup
│   ├── shaders.ts      # WGSL shader code
│   ├── game.ts         # Particle system game logic
│   └── input.ts        # Touch and mouse input handling
├── index.html          # HTML entry point
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
```

## How It Works

1. **WebGPU Initialization** - The app checks for WebGPU support and initializes the GPU device
2. **Particle System** - Creates 50 particles with random positions, velocities, and colors
3. **Touch Input** - Converts touch/mouse events to normalized coordinates [-1, 1]
4. **Physics Update** - Particles are attracted to touch points and bounce off screen edges
5. **Rendering** - Each particle is rendered as a colored square using WebGPU

## iOS Safari Testing

To test on an iOS device:

1. Make sure your iOS device and development computer are on the same network
2. Run `npm run dev` on your computer
3. Note the IP address shown in the terminal (e.g., `http://192.168.1.100:3000`)
4. Open Safari on your iOS device and navigate to that address
5. Touch the screen to interact with the particles!

### Troubleshooting iOS

If WebGPU doesn't work on iOS:
- Ensure you're running iOS 16.4 or later
- Check that WebGPU is enabled in Settings > Safari > Advanced > Feature Flags
- Try restarting Safari
- Make sure you're using Safari, not Chrome or another browser on iOS

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **WebGPU** - Modern GPU API for web graphics
- **Vite** - Fast build tool and development server
- **WGSL** - WebGPU Shading Language

## License

MIT 
