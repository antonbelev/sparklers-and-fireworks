// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Resize handler
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Global state
let mode = 'sparkler';
let fireworkType = 'all';
let soundEnabled = true;
let musicEnabled = false;
let volume = 0.7;
let autoShowInterval = null;
let particles = [];
let fireworks = [];

// Countdown state
let countdownEnabled = false;
let countdownInterval = null;
let userTimezone = null;
let locationName = 'Your Location';
let celebrationTriggered = false;

// Active sparkler state
let sparklerActive = false;
let sparklerInterval = null;
let sparklerPosition = { x: 0, y: 0 };

// Audio context (will be initialized on first user interaction)
let audioContext = null;
let sounds = {
    sparkler: [],
    launch: [],
    burst: [],
    countdownTick: null,
    celebration: null
};

// HTML Audio elements for loading sound files
let audioFiles = {
    sparkler: [],
    launch: [],
    burst: [],
    countdownTick: null,
    celebration: null
};

// Load external sound files
function loadSoundFiles() {
    const soundFiles = [
        { type: 'sparkler', files: ['sounds/sparkler.mp3'] },
        { type: 'launch', files: ['sounds/fireworks-single-shot.mp3'] },
        { type: 'burst', files: ['sounds/fireworks-1.mp3', 'sounds/firworks-short.mp3'] },
        { type: 'countdownTick', files: ['sounds/firworks-short.mp3'] },
        { type: 'celebration', files: ['sounds/fireworks-1.mp3'] }
    ];

    soundFiles.forEach(({ type, files }) => {
        files.forEach(file => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = file;
            audio.onerror = () => {
                console.log(`Could not load ${file}, using procedural sound instead`);
            };

            if (type === 'countdownTick' || type === 'celebration') {
                audioFiles[type] = audio;
            } else {
                audioFiles[type].push(audio);
            }
        });
    });
}

// Initialize audio context on first user interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadSoundFiles();
        generateSounds();
    }
}

// Generate procedural sound effects
function generateSounds() {
    // Sparkler crackling sound
    for (let i = 0; i < 3; i++) {
        sounds.sparkler.push(createSparklerSound());
    }

    // Firework launch sound
    for (let i = 0; i < 2; i++) {
        sounds.launch.push(createLaunchSound());
    }

    // Firework burst sound
    for (let i = 0; i < 3; i++) {
        sounds.burst.push(createBurstSound());
    }
}

function createSparklerSound() {
    const duration = 0.1;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (buffer.length * 0.3));
    }

    return buffer;
}

function createLaunchSound() {
    const duration = 0.8;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        const freq = 100 + (t * 200);
        data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 2) * 0.5;
    }

    return buffer;
}

function createBurstSound() {
    const duration = 1.5;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 3);
        const lowFreq = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 4);
        data[i] = (noise * 0.7 + lowFreq * 0.3) * 0.5;
    }

    return buffer;
}

function playSound(type) {
    if (!soundEnabled) return;

    // Try to play HTML audio file first (if loaded)
    const audioFileArray = audioFiles[type];
    if (audioFileArray && Array.isArray(audioFileArray) && audioFileArray.length > 0) {
        const audio = audioFileArray[Math.floor(Math.random() * audioFileArray.length)];
        if (audio && audio.readyState >= 2) { // HAVE_CURRENT_DATA or better
            audio.volume = volume;
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Fallback to procedural if play fails
                playProceduralSound(type);
            });
            return;
        }
    } else if (audioFileArray && !Array.isArray(audioFileArray)) {
        // Single audio file (countdown tick, celebration)
        if (audioFileArray.readyState >= 2) {
            audioFileArray.volume = volume;
            audioFileArray.currentTime = 0;
            audioFileArray.play().catch(() => {
                playProceduralSound(type);
            });
            return;
        }
    }

    // Fallback to procedural sound
    playProceduralSound(type);
}

function playProceduralSound(type) {
    if (!audioContext) return;

    const soundArray = sounds[type];
    if (!soundArray || (Array.isArray(soundArray) && soundArray.length === 0)) return;

    const buffer = Array.isArray(soundArray)
        ? soundArray[Math.floor(Math.random() * soundArray.length)]
        : soundArray;

    if (!buffer) return;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume * 0.3; // Reduce volume to prevent distortion

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
}

// Sparkler Spark class - realistic sparks shooting out from sparkler tip
class SparklerSpark {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Sparks shoot out in all directions with bias upward and outward
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - Math.random() * 3; // Slight upward bias

        // Spark properties
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.015;
        this.gravity = 0.12;
        this.friction = 0.96;

        // Spark color - golden white to orange to red as it cools
        this.temperature = 1; // 1 = hot white, 0 = cooled red

        // Spark size - small bright points
        this.size = Math.random() * 2.5 + 0.5;

        // Trail points for streaking effect
        this.trail = [];
        this.maxTrail = 5;
    }

    update() {
        // Store trail
        this.trail.push({ x: this.x, y: this.y, temp: this.temperature });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        // Physics
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        // Cool down
        this.life -= this.decay;
        this.temperature = this.life;

        return this.life > 0;
    }

    draw() {
        // Draw trail (fading streak)
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * this.life * 0.5;
            const trailSize = this.size * (i / this.trail.length) * 0.5;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.getColor(t.temp * 0.7);
            ctx.beginPath();
            ctx.arc(t.x, t.y, trailSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw main spark with glow
        ctx.save();
        ctx.globalAlpha = this.life;

        // Outer glow
        const glowSize = this.size * 4;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        gradient.addColorStop(0, this.getColor(this.temperature));
        gradient.addColorStop(0.3, this.getColorWithAlpha(this.temperature, 0.5));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = this.getColor(this.temperature);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.getColor(this.temperature);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    getColor(temp) {
        // Hot: white/yellow, cooling: orange, cold: red
        if (temp > 0.7) {
            return `rgb(255, ${Math.floor(220 + temp * 35)}, ${Math.floor(150 + temp * 105)})`;
        } else if (temp > 0.3) {
            return `rgb(255, ${Math.floor(100 + temp * 200)}, ${Math.floor(temp * 80)})`;
        } else {
            return `rgb(${Math.floor(200 + temp * 55)}, ${Math.floor(temp * 150)}, 0)`;
        }
    }

    getColorWithAlpha(temp, alpha) {
        if (temp > 0.7) {
            return `rgba(255, ${Math.floor(220 + temp * 35)}, ${Math.floor(150 + temp * 105)}, ${alpha})`;
        } else if (temp > 0.3) {
            return `rgba(255, ${Math.floor(100 + temp * 200)}, ${Math.floor(temp * 80)}, ${alpha})`;
        } else {
            return `rgba(${Math.floor(200 + temp * 55)}, ${Math.floor(temp * 150)}, 0, ${alpha})`;
        }
    }
}

// Handheld Sparkler class - a sparkler on a stick
class HandheldSparkler {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sparks = [];
        this.active = true;
        this.life = 1;
        this.burnRate = 0.001; // How fast it burns down

        // Stick properties
        this.stickLength = 120;
        this.burnedLength = 0;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3; // Slight angle variation

        // Wobble animation
        this.wobble = 0;
        this.wobbleSpeed = 0.1;
    }

    update() {
        if (!this.active) return false;

        // Burn down
        this.life -= this.burnRate;
        this.burnedLength = (1 - this.life) * (this.stickLength * 0.6);

        // Wobble
        this.wobble += this.wobbleSpeed;

        // Calculate tip position
        const tipX = this.x + Math.cos(this.angle + Math.sin(this.wobble) * 0.05) * (this.stickLength - this.burnedLength);
        const tipY = this.y + Math.sin(this.angle + Math.sin(this.wobble) * 0.05) * (this.stickLength - this.burnedLength);

        // Create sparks at the tip
        if (this.life > 0.1) {
            const sparkCount = Math.floor(Math.random() * 4) + 2;
            for (let i = 0; i < sparkCount; i++) {
                this.sparks.push(new SparklerSpark(tipX, tipY));
            }
        }

        // Update sparks
        this.sparks = this.sparks.filter(s => s.update());

        return this.life > 0 || this.sparks.length > 0;
    }

    draw() {
        // Draw the stick
        const endX = this.x + Math.cos(this.angle) * this.stickLength;
        const endY = this.y + Math.sin(this.angle) * this.stickLength;

        // Unburned sparkler coating
        const coatingEndX = this.x + Math.cos(this.angle) * (this.stickLength - this.burnedLength);
        const coatingEndY = this.y + Math.sin(this.angle) * (this.stickLength - this.burnedLength);

        // Draw wire/stick
        ctx.save();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw sparkler coating (gray bumpy texture)
        if (this.burnedLength < this.stickLength * 0.6) {
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(coatingEndX, coatingEndY);
            const coatingStartX = this.x + Math.cos(this.angle) * (this.stickLength * 0.4);
            const coatingStartY = this.y + Math.sin(this.angle) * (this.stickLength * 0.4);
            ctx.lineTo(coatingStartX, coatingStartY);
            ctx.stroke();
        }

        // Draw burning tip glow
        if (this.life > 0.1) {
            const tipX = coatingEndX;
            const tipY = coatingEndY;

            // Intense glow at tip
            const glowRadius = 20 + Math.sin(this.wobble * 3) * 5;
            const gradient = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, glowRadius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(tipX, tipY, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Bright white core
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Draw all sparks
        this.sparks.forEach(s => s.draw());
    }
}

// Keep the old Particle class for fireworks
class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.brightness = Math.random() * 30 + 70;
        this.alpha = 1;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - Math.random() * 2;

        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.gravity = 0.05;
        this.friction = 0.98;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.life -= this.decay;
        this.alpha = this.life;

        return this.life > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Active sparklers array
let activeSparklers = [];

// Firework class
class Firework {
    constructor(x, y, targetY, type) {
        this.x = x;
        this.startY = y;
        this.y = y;
        this.targetY = targetY;
        this.type = type || fireworkType;
        if (this.type === 'all') {
            const types = ['burst', 'fountain', 'rocket', 'willow'];
            this.type = types[Math.floor(Math.random() * types.length)];
        }

        this.hue = Math.random() * 360;
        this.exploded = false;
        this.particles = [];

        // Launch phase
        this.vy = -8;
        this.gravity = 0.08;
        this.trail = [];
    }

    update() {
        if (!this.exploded) {
            // Rising phase
            this.vy += this.gravity;
            this.y += this.vy;

            // Trail effect
            this.trail.push({ x: this.x, y: this.y, alpha: 1 });
            if (this.trail.length > 10) this.trail.shift();

            // Update trail alpha
            this.trail.forEach((t, i) => {
                t.alpha = i / this.trail.length;
            });

            // Check if reached target
            if (this.y <= this.targetY || this.vy > 0) {
                this.explode();
                playSound('burst');
            }
        } else {
            // Update particles
            this.particles = this.particles.filter(p => p.update());
        }

        return !this.exploded || this.particles.length > 0;
    }

    explode() {
        this.exploded = true;
        const particleCount = this.type === 'fountain' ? 150 : 100;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle(i, particleCount));
        }
    }

    createParticle(index, total) {
        const particle = {
            x: this.x,
            y: this.y,
            alpha: 1,
            life: 1,
            size: Math.random() * 3 + 1
        };

        switch (this.type) {
            case 'burst':
                const angle = (Math.PI * 2 * index) / total;
                const speed = Math.random() * 5 + 3;
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                particle.decay = Math.random() * 0.015 + 0.01;
                particle.gravity = 0.1;
                particle.hue = this.hue + Math.random() * 30 - 15;
                break;

            case 'fountain':
                const fountainAngle = Math.random() * Math.PI - Math.PI / 2;
                const fountainSpeed = Math.random() * 8 + 4;
                particle.vx = Math.cos(fountainAngle) * fountainSpeed * 0.5;
                particle.vy = Math.sin(fountainAngle) * fountainSpeed;
                particle.decay = Math.random() * 0.02 + 0.015;
                particle.gravity = 0.2;
                particle.hue = this.hue + Math.random() * 60 - 30;
                break;

            case 'rocket':
                const rocketAngle = (Math.PI * 2 * index) / total;
                const rocketSpeed = Math.random() * 3 + 2;
                particle.vx = Math.cos(rocketAngle) * rocketSpeed;
                particle.vy = Math.sin(rocketAngle) * rocketSpeed - 2;
                particle.decay = Math.random() * 0.01 + 0.005;
                particle.gravity = 0.05;
                particle.hue = this.hue + (index / total) * 60;
                break;

            case 'willow':
                const willowAngle = (Math.PI * 2 * index) / total;
                const willowSpeed = Math.random() * 4 + 2;
                particle.vx = Math.cos(willowAngle) * willowSpeed;
                particle.vy = Math.sin(willowAngle) * willowSpeed;
                particle.decay = Math.random() * 0.008 + 0.004;
                particle.gravity = 0.15;
                particle.friction = 0.95;
                particle.hue = this.hue + Math.random() * 20 - 10;
                break;
        }

        particle.update = function() {
            this.vx *= (this.friction || 0.98);
            this.vy *= (this.friction || 0.98);
            this.vy += this.gravity;

            this.x += this.vx;
            this.y += this.vy;

            this.life -= this.decay;
            this.alpha = this.life;

            return this.life > 0;
        };

        return particle;
    }

    draw() {
        if (!this.exploded) {
            // Draw trail
            this.trail.forEach((t, i) => {
                ctx.save();
                ctx.globalAlpha = t.alpha * 0.5;
                ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;
                ctx.beginPath();
                ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Draw rocket
            ctx.save();
            ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // Draw explosion particles
            this.particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = `hsl(${p.hue}, 100%, 60%)`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
    }
}

// Input handlers
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let lastSparkleTime = 0;

function handleStart(x, y) {
    initAudio();
    isDrawing = true;
    lastX = x;
    lastY = y;
    lastSparkleTime = Date.now();

    if (mode === 'fireworks') {
        launchFirework(x);
    }
}

function handleMove(x, y) {
    if (!isDrawing || mode !== 'sparkler') return;

    const now = Date.now();
    if (now - lastSparkleTime > 16) { // ~60fps
        createSparkles(x, y);
        lastSparkleTime = now;
    }

    lastX = x;
    lastY = y;
}

function handleEnd() {
    isDrawing = false;
}

function createSparkles(x, y) {
    const hue = Math.random() * 60 + 30; // Golden colors
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y, hue));
    }

    if (Math.random() < 0.3) {
        playSound('sparkler');
    }
}

function launchFirework(x) {
    const targetY = height * (Math.random() * 0.3 + 0.2);
    fireworks.push(new Firework(x, height, targetY, fireworkType));
    playSound('launch');
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    handleStart(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
});

canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseleave', handleEnd);

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    Array.from(e.touches).forEach(touch => {
        handleStart(touch.clientX, touch.clientY);
    });
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    Array.from(e.touches).forEach(touch => {
        handleMove(touch.clientX, touch.clientY);
    });
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
        handleEnd();
    }
});

// UI Controls
// UI Toggle - Hide/Show all UI elements
document.getElementById('toggle-ui').addEventListener('click', () => {
    const mainUI = document.getElementById('main-ui');
    const toggleBtn = document.getElementById('toggle-ui');

    mainUI.classList.toggle('hidden');
    toggleBtn.classList.toggle('ui-hidden');

    // Update icon
    const icon = toggleBtn.querySelector('.toggle-icon');
    icon.textContent = mainUI.classList.contains('hidden') ? '👁‍🗨' : '👁';
});

// Sound toggle
document.getElementById('sound-btn').addEventListener('click', () => {
    const btn = document.getElementById('sound-btn');
    soundEnabled = !soundEnabled;
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    btn.classList.toggle('sound-off', !soundEnabled);
});

// Helper to update active button state
function setActiveButton(activeId) {
    document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
    if (activeId) {
        document.getElementById(activeId).classList.add('active');
    }
}

function startAutoShow() {
    stopAutoShow();
    autoShowInterval = setInterval(() => {
        const x = Math.random() * width;
        launchFirework(x);
    }, 1500);
}

function stopAutoShow() {
    if (autoShowInterval) {
        clearInterval(autoShowInterval);
        autoShowInterval = null;
    }
}

// Geolocation and Timezone Detection
function detectUserLocation() {
    // Try to get timezone from browser
    try {
        userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Use the full timezone string instead of just city name
        if (userTimezone) {
            locationName = userTimezone; // e.g., "America/New_York"
        }

        console.log('Timezone detected:', userTimezone);
    } catch (e) {
        console.log('Could not detect timezone, using system time');
        userTimezone = 'local';
        locationName = 'Local Time';
    }

    updateLocationDisplay();
}

function updateLocationDisplay() {
    const locationElement = document.getElementById('location-name');
    if (locationElement) {
        locationElement.textContent = locationName;
    }
}

// Countdown Timer Functions
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    celebrationTriggered = false;
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Update immediately
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    hideCelebration();
}

function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Calculate next New Year (could be this year or next year)
    let nextNewYear = new Date(currentYear + 1, 0, 1, 0, 0, 0);

    // If we're already past midnight on Jan 1, the "next" new year is actually next year
    if (now.getMonth() === 0 && now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        // It's New Year! Show celebration
        if (!celebrationTriggered) {
            triggerCelebration(currentYear);
        }
        return;
    }

    const timeRemaining = nextNewYear - now;

    if (timeRemaining <= 0) {
        // It's New Year!
        if (!celebrationTriggered) {
            triggerCelebration(currentYear + 1);
        }
        return;
    }

    // Calculate time components
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Update display
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    document.getElementById('target-year').textContent = nextNewYear.getFullYear();

    // Play tick sound in last 10 seconds
    if (timeRemaining < 10000 && seconds !== 0) {
        playSound('countdownTick');
    }
}

function triggerCelebration(year) {
    celebrationTriggered = true;

    // Hide countdown, show celebration
    document.getElementById('countdown-overlay').classList.add('hidden');
    document.getElementById('celebration-overlay').classList.remove('hidden');
    document.getElementById('celebration-year').textContent = year;

    // Play celebration sound
    playSound('celebration');

    // Auto fireworks show
    mode = 'auto';
    startAutoShow();

    // Hide celebration after 10 seconds
    setTimeout(hideCelebration, 10000);
}

function hideCelebration() {
    document.getElementById('celebration-overlay').classList.add('hidden');
}

// Function to stop all active effects
function stopAllEffects() {
    // Stop sparkler sound loop
    sparklerActive = false;
    if (sparklerInterval) {
        clearInterval(sparklerInterval);
        sparklerInterval = null;
    }

    // Clear active sparklers
    activeSparklers = [];

    // Stop auto show
    stopAutoShow();

    // Clear active button state
    setActiveButton(null);
}

// Action button handlers - SPARKLER
document.getElementById('sparkler-btn').addEventListener('click', () => {
    initAudio();

    // Stop any other effects first
    stopAllEffects();
    setActiveButton('sparkler-btn');

    // Create multiple handheld sparklers at different positions across the screen
    const positions = [
        { x: width * 0.2, y: height * 0.7 },
        { x: width * 0.35, y: height * 0.75 },
        { x: width * 0.5, y: height * 0.7 },
        { x: width * 0.65, y: height * 0.75 },
        { x: width * 0.8, y: height * 0.7 }
    ];

    positions.forEach(pos => {
        activeSparklers.push(new HandheldSparkler(pos.x, pos.y));
    });

    // Play sparkler sound continuously while active
    sparklerActive = true;
    sparklerInterval = setInterval(() => {
        if (activeSparklers.length > 0 && Math.random() < 0.2) {
            playSound('sparkler');
        }
    }, 200);
});

document.getElementById('fireworks-btn').addEventListener('click', () => {
    initAudio();

    // Stop any active effects first
    stopAllEffects();

    // Launch multiple fireworks
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const x = width * (0.3 + Math.random() * 0.4);
            launchFirework(x);
        }, i * 300);
    }
});

// Auto Show button handler
document.getElementById('auto-btn').addEventListener('click', () => {
    initAudio();

    if (autoShowInterval) {
        // Stop if already running
        stopAllEffects();
    } else {
        // Start auto show
        stopAllEffects();
        setActiveButton('auto-btn');
        startAutoShow();
    }
});

// Initialize location detection and start countdown by default
detectUserLocation();
countdownEnabled = true;
startCountdown();

// Animation loop
function animate() {
    // Fade effect instead of clear for trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Update and draw handheld sparklers
    activeSparklers = activeSparklers.filter(s => s.update());
    activeSparklers.forEach(s => s.draw());

    // Stop sound when all sparklers are done
    if (activeSparklers.length === 0 && sparklerActive) {
        stopAllEffects();
    }

    // Update and draw particles (for old particle effects)
    particles = particles.filter(p => p.update());
    particles.forEach(p => p.draw());

    // Update and draw fireworks
    fireworks = fireworks.filter(f => f.update());
    fireworks.forEach(f => f.draw());

    requestAnimationFrame(animate);
}

animate();
