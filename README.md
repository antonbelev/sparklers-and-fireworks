# ✨ Sparklers & Fireworks ✨

A beautiful, interactive web app for celebrating with digital sparklers and fireworks - perfect for those who forgot to buy the real thing, or who care about noise and pollution!

![Sparklers and Fireworks](https://img.shields.io/badge/celebrate-digitally-gold?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/deployed-github%20pages-success?style=for-the-badge)

## 🎆 Features

- **Interactive Sparklers** - Draw sparklers with your mouse or touch
- **Multiple Firework Types**:
  - Burst - Classic circular explosion
  - Fountain - Cascading particles
  - Rocket - Multi-colored rising effects
  - Willow - Graceful falling trails
- **Auto Show Mode** - Sit back and enjoy an automated fireworks display
- **New Year Countdown** - Location-aware countdown to midnight with automatic celebration
  - Detects your timezone automatically
  - Shows hours, minutes, and seconds until New Year
  - Triggers spectacular fireworks display at midnight
  - Generic year support (works for any year)
- **Royalty-Free Sound Effects** - Support for external sound files with procedural fallback
- **Mobile & Desktop Friendly** - Fully responsive with touch support
- **Eco-Friendly** - No pollution, no noise complaints!

## 🚀 Live Demo

Visit the live app: [Sparklers & Fireworks](https://yourusername.github.io/sparklers-and-fireworks/)

*(Replace `yourusername` with your GitHub username after deploying)*

## 🎮 How to Use

1. **Sparkler Mode** - Click and drag (or touch and drag on mobile) to draw sparklers
2. **Fireworks Mode** - Click or tap anywhere to launch fireworks
3. **Auto Show Mode** - Sit back and watch the automatic fireworks display
4. **New Year Countdown** - Toggle the countdown to see time remaining until midnight in your timezone
5. **Customize** - Use the menu to select different firework types, adjust volume, and toggle sound effects

## 🎵 Sound Effects

This app includes realistic sound effects from [Pixabay](https://pixabay.com/)!

### Included Sounds:
- Sparkler crackling
- Firework launches and bursts
- Countdown ticks
- Celebration sounds

All sounds are royalty-free from Pixabay. See `sounds/README.md` for details and attribution.

### Fallback System:
If sound files fail to load, the app automatically uses procedurally generated Web Audio API sounds as a fallback, so it always works perfectly.

## 🛠️ Technical Details

Built with vanilla JavaScript using:
- HTML5 Canvas for rendering
- Web Audio API for procedural sound generation with HTML5 Audio fallback
- Intl API for timezone detection
- Geolocation API for location detection
- CSS3 for responsive UI and animations
- Particle systems for realistic effects

### Sound System

The app features a hybrid sound system:
- **Procedural sounds** - Generated using Web Audio API (no files needed)
- **External sounds** - Supports MP3 files for realistic effects
- **Automatic fallback** - If external files aren't available, uses procedural sounds
- **Smart loading** - Only loads files that exist, gracefully handles missing files

### Countdown System

- **Timezone Detection** - Automatically detects user's timezone using `Intl.DateTimeFormat()`
- **Generic Year Support** - Calculates next New Year dynamically, works for any year
- **Location Display** - Extracts city name from timezone (e.g., "America/New_York" → "New York")
- **Midnight Celebration** - Automatically triggers at midnight with fireworks show and message

## 📦 Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sparklers-and-fireworks.git
cd sparklers-and-fireworks
```

2. Open `index.html` in your browser, or use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

3. Visit `http://localhost:8000`

## 🚢 Deployment to GitHub Pages

The app automatically deploys to GitHub Pages via GitHub Actions when you push to the main branch.

### Setup:

1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Push to the main branch
4. Your app will be live at `https://yourusername.github.io/sparklers-and-fireworks/`

### Manual Deployment:

Alternatively, you can deploy manually:

1. Go to repository Settings → Pages
2. Select "Deploy from a branch"
3. Choose `main` branch and `/ (root)` folder
4. Save and wait for deployment

## 🎨 Customization

### Adding New Firework Types

Edit `app.js` and add a new case in the `createParticle` method of the `Firework` class:

```javascript
case 'yourtype':
    // Define particle behavior
    particle.vx = ...
    particle.vy = ...
    particle.decay = ...
    // etc.
    break;
```

### Changing Colors

Modify the `hue` values in the particle creation code to change color schemes.

### Adjusting Performance

Reduce particle counts in the `explode()` method for better performance on slower devices.

## 📱 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎵 Audio Attribution

### Built-in Procedural Sounds

The app includes procedurally generated sound effects using the Web Audio API:
- White noise with exponential decay (sparklers)
- Sine waves with frequency modulation (launches)
- Combined noise and low-frequency oscillations (bursts)

### Included Sound Effects

This app includes royalty-free sound effects from **[Pixabay](https://pixabay.com/)**:
- Sparkler crackling sounds
- Firework launch and burst effects
- Countdown ticks
- Celebration sounds

**License:** Pixabay Content License - Free for commercial and non-commercial use, no attribution required.

See `sounds/README.md` for complete details and attribution information.

## 📄 License

MIT License - feel free to use, modify, and share!

## 🙏 Acknowledgments

- Inspired by the joy of real fireworks without the environmental impact
- Built for celebrating with friends and family, especially for those who forgot to buy sparklers!

## 🌟 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new firework effects
- Improve performance
- Enhance mobile experience
- Add new features

## 💝 Share the Joy

If you enjoy this project, please:
- ⭐ Star the repository
- 🔗 Share with friends and family
- 🎆 Celebrate responsibly!

---

**Happy Celebrating!** 🎉✨🎆

Made with ❤️ for eco-conscious celebrations
