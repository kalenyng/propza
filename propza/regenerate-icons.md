# PWA Icon Regeneration Guide

## The Problem
Your PWA icons have black borders because they don't fill the entire canvas properly.

## Quick Fix Steps

### 1. Use Online Generator (Fastest)

**Go to**: https://realfavicongenerator.net/

**Settings**:
- Upload: `public/propza-logo.png`
- Background: `#0ea472` (your brand green)
- Padding: `0%` (to fill entire canvas)
- Platform: PWA

**Download** and replace files in `/public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 2. Alternative Generator

**Go to**: https://www.pwabuilder.com/imageGenerator

Same settings as above.

### 3. After Regenerating

```bash
# Build and deploy
npm run build
git add public/icons/
git commit -m "Fix PWA icons - remove black borders"
git push
```

### 4. Test

- Uninstall existing PWA from phone
- Reinstall from browser
- Check home screen icon (should have no black borders)

## Why This Happens

The current icons from AppImages likely have:
- Transparent backgrounds
- Not filling entire canvas
- Black showing through from device background

The fix ensures icons:
- Fill entire square
- Have solid background
- No transparent edges
