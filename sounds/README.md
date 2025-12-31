# Sound Effects Directory

This directory contains royalty-free sound effects for the sparklers and fireworks app.

## 🎵 Included Sound Files

All sound effects in this directory are from **[Pixabay](https://pixabay.com/)** and are royalty-free.

### Sound Files:

- `sparkler.mp3` - Sparkler crackling/sizzling sound
- `fireworks-single-shot.mp3` - Single firework launch sound
- `fireworks-1.mp3` - Firework burst/explosion sound
- `firworks-short.mp3` - Short firework burst sound

### Usage in App:

- **Sparkler effects** → `sparkler.mp3`
- **Firework launches** → `fireworks-single-shot.mp3`
- **Firework bursts** → `fireworks-1.mp3`, `firworks-short.mp3` (randomly selected)
- **Countdown ticks** → `firworks-short.mp3`
- **New Year celebration** → `fireworks-1.mp3`

## 📜 Attribution

**Source:** [Pixabay Sound Effects](https://pixabay.com/sound-effects/)

**License:** Pixabay Content License
- Free for commercial and non-commercial use
- No attribution required (but appreciated!)
- More info: https://pixabay.com/service/license-summary/

All sounds in this directory are sourced from Pixabay under their free license.

## 🔄 Fallback System

If sound files are missing or fail to load, the app automatically falls back to procedurally generated Web Audio API sounds, ensuring the app always works.

## 📥 Adding More Sounds

You can add additional sounds from these recommended sources:

1. **[Pixabay Sound Effects](https://pixabay.com/sound-effects/)** - Royalty-free, no attribution required
2. **[Mixkit Sound Effects](https://mixkit.co/free-sound-effects/)** - 100% free, commercially licensed
3. **[Freesound.org](https://freesound.org/)** - Creative Commons (check individual licenses)

Simply download MP3 files and the app will automatically try to load them based on the filenames configured in `app.js`.
