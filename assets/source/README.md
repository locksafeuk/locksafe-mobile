# LockSafe App Icon Source Files

This folder contains SVG source files for all app icons and assets.

## Files

| File | Description | Export Size |
|------|-------------|-------------|
| `icon.svg` | Main app icon (iOS & Android) | 1024x1024 |
| `adaptive-icon-foreground.svg` | Android adaptive icon foreground | 1024x1024 |
| `adaptive-icon-background.svg` | Android adaptive icon background | 1024x1024 |
| `monochrome-icon.svg` | Android monochrome icon | 1024x1024 |
| `splash-icon.svg` | Splash screen icon | 288x288 |

## How to Generate PNG Assets

### Option 1: Use the HTML Generator (Recommended)

1. Open `../scripts/generate-assets.html` in a web browser
2. Click "Download All Assets" to get a ZIP with all PNGs
3. Extract and copy files to `assets/` folder

### Option 2: Use Online Tools

1. Go to [CloudConvert](https://cloudconvert.com/svg-to-png) or [SVG to PNG](https://svgtopng.com/)
2. Upload each SVG file
3. Export at the sizes specified above
4. Save to the `assets/` folder

### Option 3: Use Command Line (requires Inkscape)

```bash
# Install Inkscape
# macOS: brew install inkscape
# Ubuntu: sudo apt install inkscape

# Generate PNGs
inkscape icon.svg -w 1024 -h 1024 -o ../icon.png
inkscape adaptive-icon-foreground.svg -w 1024 -h 1024 -o ../adaptive-icon.png
inkscape adaptive-icon-foreground.svg -w 1024 -h 1024 -o ../android-icon-foreground.png
inkscape adaptive-icon-background.svg -w 1024 -h 1024 -o ../android-icon-background.png
inkscape monochrome-icon.svg -w 1024 -h 1024 -o ../android-icon-monochrome.png
inkscape splash-icon.svg -w 288 -h 288 -o ../splash-icon.png
inkscape icon.svg -w 48 -h 48 -o ../favicon.png
```

### Option 4: Use Node.js Script

```bash
# Install dependencies
npm install canvas

# Run generator
node ../scripts/generate-assets.js
```

## Brand Guidelines

- **Primary Color**: Orange `#f97316`
- **Dark Orange**: `#c2410c`
- **Background**: White `#ffffff`
- **Text**: White on orange backgrounds

## Asset Requirements

### iOS
- `icon.png` - 1024x1024 (single image, system applies rounding)

### Android
- `adaptive-icon.png` - 1024x1024 foreground (72dp safe zone)
- `android-icon-background.png` - 1024x1024 solid background
- `android-icon-foreground.png` - 1024x1024 foreground layer
- `android-icon-monochrome.png` - 1024x1024 for themed icons

### Splash Screen
- `splash-icon.png` - 288x288 (displayed on `#f97316` background)

### Web
- `favicon.png` - 48x48
