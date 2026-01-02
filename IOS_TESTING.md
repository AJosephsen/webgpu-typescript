# iOS Safari Testing Guide

## Prerequisites

- iOS device running **iOS 16.4 or later**
- Access to Settings app
- Development computer and iOS device on the same WiFi network

## Step 1: Enable WebGPU on iOS

1. Open **Settings** app on your iOS device
2. Scroll down and tap **Safari**
3. Scroll down and tap **Advanced**
4. Tap **Feature Flags** (or **Experimental Features**)
5. Find **WebGPU** in the list and toggle it **ON**
6. Restart Safari if it was already open

## Step 2: Start the Development Server

On your development computer:

```bash
npm install
npm run dev
```

Note the local network URL shown in the terminal (e.g., `http://192.168.1.100:3000`)

## Step 3: Access from iOS Safari

1. Open **Safari** on your iOS device (must be Safari, not Chrome or other browsers)
2. Enter the network URL from Step 2 in the address bar
3. The app should load with a black screen showing particle effects

## Step 4: Interact with the Game

- **Tap** anywhere on the screen to attract particles
- **Multi-touch** - use multiple fingers to create multiple attraction points
- **Drag** - particles will follow your finger
- New particles spawn when you touch the screen

## Expected Behavior

- **FPS Counter**: Top-left corner should show ~60 FPS
- **Touch Count**: Shows number of active touch points
- **Particles**: Colorful squares that bounce and move around
- **Smooth Animation**: Hardware-accelerated rendering via WebGPU

## Troubleshooting

### "WebGPU is not supported" Error

**Solution**: Make sure WebGPU is enabled in Settings > Safari > Advanced > Feature Flags

### App doesn't load

**Possible causes**:
- iOS version is older than 16.4
- Not using Safari browser (Chrome/Firefox won't work)
- WebGPU flag not enabled
- Device and computer not on same network

**Solutions**:
1. Update to iOS 16.4 or later
2. Use Safari browser only
3. Enable WebGPU in Safari settings
4. Check network connection

### Particles are slow or choppy

**Possible causes**:
- Too many particles for device
- Other apps using resources

**Solutions**:
- Close other apps
- Restart Safari
- Consider reducing particle count in `src/game.ts` (line 17)

### Black screen with no error

**Check**:
1. Open Safari Developer Console (if available)
2. Look for JavaScript errors
3. Verify WebGPU is enabled
4. Try reloading the page

## Performance Tips

For best performance on iOS:
- Close background apps
- Use a device with A12 chip or newer (iPhone XS/XR or later)
- Ensure good WiFi signal for faster loading
- Use landscape orientation for larger canvas

## Production Deployment

To deploy to a public URL:

```bash
npm run build
```

Upload the `dist/` folder to any web hosting service. Users can then access it directly at your domain (no dev server needed).

## WebGPU Compatibility

As of 2024, WebGPU on iOS Safari is:
- ✅ Available on iOS 16.4+
- ✅ Requires manual flag enable
- ⚠️ Still evolving (API may change)
- 📱 Works on iPhone and iPad

For desktop testing:
- Chrome 113+ (stable)
- Edge 113+ (stable)
- Safari Technology Preview on macOS
