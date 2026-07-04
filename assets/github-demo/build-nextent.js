// ===== SOUND SYSTEM (Web Audio API) =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(freq, duration, type = 'sine', vol = 0.15) {
    if (!soundEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

function sfxClick() { playTone(800, 0.08, 'sine', 0.1); }
function sfxSelect() { playTone(520, 0.12, 'triangle', 0.12); playTone(780, 0.1, 'triangle', 0.08); }
function sfxDraw() {
    playTone(300, 0.1, 'triangle', 0.1);
    setTimeout(() => playTone(450, 0.1, 'triangle', 0.1), 80);
    setTimeout(() => playTone(600, 0.15, 'triangle', 0.12), 160);
}
function sfxCorrect() {
    playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 120);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.15), 240);
}
function sfxWrong() {
    playTone(300, 0.2, 'sawtooth', 0.08);
    setTimeout(() => playTone(250, 0.3, 'sawtooth', 0.06), 150);
}
function sfxTick() { playTone(1000, 0.03, 'sine', 0.04); }
function sfxUrgent() { playTone(800, 0.06, 'square', 0.06); }
function sfxTimeUp() {
    playTone(400, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.1), 120);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.08), 240);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('soundIcon').textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) { initAudio(); sfxClick(); }
}

// ===== PARTICLES =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.3;
        this.speedY = -(Math.random() * 0.25 + 0.05);
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * 0.3 + 0.05;
        // Mix gold & green particles
        this.color = Math.random() > 0.5
            ? `rgba(212, 168, 83, ${this.opacity})`
            : `rgba(91, 140, 90, ${this.opacity})`;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < -10) { this.reset(); this.y = canvas.height + 10; }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== COUNTER ANIMATION =====
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounters(); heroObserver.disconnect(); } });
}, { threshold: 0.5 });
heroObserver.observe(document.querySelector('.hero-stats'));

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.nx-modules__card, .usp-card, .section-tag, .section-title-serif, .message-card, .problem-card, .specs-bar, .cinema-player, .nx-game__header, .nx-modules__header, .nx-modules__product, .nx-modules__features').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    revealObserver.observe(el);
});

document.querySelectorAll('.nx-modules__card').forEach((c, i) => { c.style.transitionDelay = `${i * 0.1}s`; });
document.querySelectorAll('.usp-card').forEach((c, i) => { c.style.transitionDelay = `${i * 0.15}s`; });

// ===== CINEMATIC PLAYER =====
let cinemaInterval = null;
let cinemaScene = 0;
let cinemaPlaying = false;
const totalScenes = 8;
const sceneDuration = 6000; // 6 seconds per scene

function goToScene(idx) {
    cinemaScene = idx;
    const scenes = document.querySelectorAll('.cinema-scene');
    const dots = document.querySelectorAll('.cinema-dot');
    scenes.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    document.getElementById('cinemaProgressBar').style.width = `${((idx + 1) / totalScenes) * 100}%`;
    document.getElementById('cinemaTime').textContent = `Scene ${idx + 1}/${totalScenes}`;
    // Re-trigger animations by cloning scene content
    const activeScene = scenes[idx];
    activeScene.querySelectorAll('.scene-caption, .scene-headline, .feature-word, .feature-desc, .finale-logo, .finale-divider, .finale-tagline').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // trigger reflow
        el.style.animation = '';
    });
    initAudio();
    if (idx === 3 || idx === 4 || idx === 5) sfxSelect(); // feature scenes
    else sfxClick();
}

function nextScene() {
    const next = (cinemaScene + 1) % totalScenes;
    goToScene(next);
    if (next === 0 && cinemaPlaying) stopCinema(); // loop once
}

function startCinema() {
    cinemaPlaying = true;
    document.getElementById('cinemaPlayIcon').textContent = '⏸';
    cinemaInterval = setInterval(nextScene, sceneDuration);
}

function stopCinema() {
    cinemaPlaying = false;
    document.getElementById('cinemaPlayIcon').textContent = '▶';
    clearInterval(cinemaInterval);
}

function toggleCinema() {
    initAudio();
    if (cinemaPlaying) stopCinema();
    else startCinema();
}

// Auto-start when visible
const cinemaObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting && !cinemaPlaying) startCinema();
        else if (!e.isIntersecting && cinemaPlaying) stopCinema();
    });
}, { threshold: 0.4 });
cinemaObserver.observe(document.getElementById('cinemaPlayer'));

// ===== SCROLL TO =====
function scrollToSection(id) {
    initAudio(); sfxClick();
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// ===== GAME LOGIC =====
const situations = [
    { text: "☔ Your tent floor gets muddy after rain.", hint: "Which part touches the ground?", answer: ["ground"], emoji: "🌧️", tip: "The modular groundsheet can be swapped in minutes — no need to replace the whole tent!" },
    { text: "💥 One side panel is damaged by strong wind.", hint: "Which part forms the tent walls?", answer: ["wall"], emoji: "💨", tip: "Snap-lock edges make wall replacement tool-free. Just unclip and swap!" },
    { text: "🎒 You need more storage for a 3-day festival.", hint: "Where do you keep your gear organized?", answer: ["pocket"], emoji: "🎪", tip: "Clip-on pockets expand your storage without replacing the entire tent structure." },
    { text: "👥 Your group grows from 2 to 4 people.", hint: "You need bigger structure...", answer: ["wall", "pole"], emoji: "👨‍👩‍👧‍👦", tip: "Add extra wall panels and poles to expand. Modular = flexible for any group size!" },
    { text: "🔥 It's 40°C at the desert festival. You're melting!", hint: "What deflects solar radiation?", answer: ["cooling"], emoji: "☀️", tip: "The cooling reflective layer deflects 90% of solar heat. Just clip it on!" },
    { text: "🌪️ A storm broke two support poles.", hint: "What holds the tent structure up?", answer: ["pole"], emoji: "⚡", tip: "Magnetic ribbing poles can be individually replaced. No full tent purchase needed!" },
    { text: "🏔️ Upgrading from festival to mountain trek.", hint: "You need stronger top protection.", answer: ["roof", "pole"], emoji: "🗻", tip: "Swap to heavy-duty roof panel + reinforced poles. Same base, different mission!" },
    { text: "🌞 The roof's UV coating has worn off after 2 years.", hint: "Which part is on top?", answer: ["roof"], emoji: "🔆", tip: "Replace just the roof panel — extends your tent's life by another 3-5 years!" }
];

let currentSituation = null;
let selectedModules = [];
let timerInterval = null;
let timeLeft = 30;
let score = 0;
let total = 0;
let streak = 0;
let bestStreak = 0;
let usedCards = [];

const partMap = {
    roof: ['svg-roof'],
    wall: ['svg-wall-l', 'svg-wall-r'],
    ground: ['svg-ground'],
    pole: ['svg-pole1', 'svg-pole2'],
    pocket: ['svg-pocket1', 'svg-pocket2'],
    cooling: ['svg-cooling']
};

function drawCard() {
    initAudio();
    sfxDraw();
    selectedModules = [];
    document.querySelectorAll('.nx-mod').forEach(b => { b.classList.remove('selected'); b.disabled = false; });
    resetTentVisual();

    let available = situations.filter((_, i) => !usedCards.includes(i));
    if (available.length === 0) { usedCards = []; available = situations; }

    const idx = situations.indexOf(available[Math.floor(Math.random() * available.length)]);
    usedCards.push(idx);
    currentSituation = situations[idx];

    const cardInner = document.getElementById('cardInner');
    cardInner.classList.add('active');
    cardInner.style.animation = 'shake 0.5s ease';
    setTimeout(() => cardInner.style.animation = '', 500);

    cardInner.querySelector('.card-front').innerHTML = `
        <div class="card-emoji">${currentSituation.emoji}</div>
        <p>${currentSituation.text}</p>
        <p class="card-hint">💡 ${currentSituation.hint}</p>
    `;

    highlightDamaged(currentSituation.answer);
    document.getElementById('nxTentStatus').textContent = '⚠️ Needs Repair';

    document.getElementById('btnSubmit').style.display = 'block';
    document.getElementById('btnDraw').disabled = true;
    startTimer();
}

function highlightDamaged(answers) {
    answers.forEach(mod => {
        const ids = partMap[mod];
        if (ids) ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('damaged');
        });
    });
}

function resetTentVisual() {
    document.querySelectorAll('.tent-part').forEach(p => p.classList.remove('damaged', 'highlight'));
    document.getElementById('nxTentStatus').textContent = '● Ready';
}

function selectModule(mod) {
    if (!currentSituation) return;
    initAudio();
    const btn = document.querySelector(`.nx-mod[data-mod="${mod}"]`);

    if (selectedModules.includes(mod)) {
        selectedModules = selectedModules.filter(m => m !== mod);
        btn.classList.remove('selected');
        sfxClick();
        const ids = partMap[mod];
        if (ids) ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('highlight');
            // Re-damage if it's an answer
            if (currentSituation.answer.includes(mod) && el) el.classList.add('damaged');
        });
    } else {
        selectedModules.push(mod);
        btn.classList.add('selected');
        sfxSelect();
        const ids = partMap[mod];
        if (ids) ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.classList.remove('damaged'); el.classList.add('highlight'); }
        });
    }

    document.getElementById('nxTentStatus').textContent =
        selectedModules.length > 0
            ? `🔧 ${selectedModules.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ')}`
            : 'Select modules to fix';
}

// ===== DRAMATIC COUNTDOWN MUSIC ENGINE =====
let bgDrone = null;
let bgPulse = null;
let bgHighTension = null;
let heartbeatInterval = null;

function startDramaticMusic() {
    if (!soundEnabled || !audioCtx) return;
    stopDramaticMusic();

    // Low drone — continuous ominous tone
    bgDrone = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();
    bgDrone.type = 'sawtooth';
    bgDrone.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A
    droneGain.gain.setValueAtTime(0, audioCtx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 2);
    bgDrone.connect(droneGain).connect(audioCtx.destination);
    bgDrone._gain = droneGain;
    bgDrone.start();

    // Pulse — rhythmic heartbeat
    bgPulse = audioCtx.createOscillator();
    const pulseGain = audioCtx.createGain();
    bgPulse.type = 'sine';
    bgPulse.frequency.setValueAtTime(82, audioCtx.currentTime); // Low E
    pulseGain.gain.setValueAtTime(0, audioCtx.currentTime);
    bgPulse.connect(pulseGain).connect(audioCtx.destination);
    bgPulse._gain = pulseGain;
    bgPulse.start();

    // Heartbeat pump
    let bpm = 60;
    function heartbeat() {
        if (!bgPulse || !bgPulse._gain) return;
        const now = audioCtx.currentTime;
        bgPulse._gain.gain.cancelScheduledValues(now);
        bgPulse._gain.gain.setValueAtTime(0.06, now);
        bgPulse._gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    }
    heartbeat();
    heartbeatInterval = setInterval(() => {
        heartbeat();
        // Speed up heartbeat based on time left
        if (timeLeft <= 5) bpm = 180;
        else if (timeLeft <= 10) bpm = 140;
        else if (timeLeft <= 20) bpm = 100;
        else bpm = 70;
        clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(heartbeat, 60000 / bpm);
    }, 60000 / bpm);
}

function escalateTension() {
    if (!soundEnabled || !audioCtx || bgHighTension) return;

    // High tension layer — eerie high pitch
    bgHighTension = audioCtx.createOscillator();
    const htGain = audioCtx.createGain();
    bgHighTension.type = 'sine';
    bgHighTension.frequency.setValueAtTime(440, audioCtx.currentTime);
    bgHighTension.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 10);
    htGain.gain.setValueAtTime(0, audioCtx.currentTime);
    htGain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 3);
    bgHighTension.connect(htGain).connect(audioCtx.destination);
    bgHighTension._gain = htGain;
    bgHighTension.start();

    // Increase drone volume
    if (bgDrone && bgDrone._gain) {
        bgDrone._gain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 2);
        bgDrone.frequency.linearRampToValueAtTime(65, audioCtx.currentTime + 5);
    }
}

function stopDramaticMusic() {
    const fadeTime = audioCtx ? audioCtx.currentTime + 0.3 : 0;
    [bgDrone, bgPulse, bgHighTension].forEach(osc => {
        if (osc) {
            try {
                if (osc._gain) osc._gain.gain.linearRampToValueAtTime(0.001, fadeTime);
                osc.stop(fadeTime + 0.1);
            } catch(e) {}
        }
    });
    bgDrone = null; bgPulse = null; bgHighTension = null;
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
}

function startTimer() {
    timeLeft = 30;
    const wrap = document.getElementById('timerWrap');
    const progress = document.getElementById('timerProgress');
    const text = document.getElementById('timerText');

    wrap.classList.add('active');
    progress.classList.remove('danger');
    const circ = 2 * Math.PI * 54;
    progress.style.strokeDasharray = circ;
    progress.style.strokeDashoffset = 0;

    startDramaticMusic();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        text.textContent = timeLeft;
        progress.style.strokeDashoffset = circ * (1 - timeLeft / 30);

        if (timeLeft <= 10) {
            progress.classList.add('danger');
            sfxUrgent();
            escalateTension();
        } else if (timeLeft <= 20) {
            sfxTick();
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            stopDramaticMusic();
            sfxTimeUp();
            submitAnswer(true);
        }
    }, 1000);
}

function submitAnswer(timedOut = false) {
    clearInterval(timerInterval);
    stopDramaticMusic();
    initAudio();
    total++;

    const correct = currentSituation.answer;
    const isCorrect = !timedOut &&
        correct.length === selectedModules.length &&
        correct.every(a => selectedModules.includes(a));

    if (isCorrect) { score++; streak++; sfxCorrect(); }
    else { streak = 0; timedOut ? sfxTimeUp() : sfxWrong(); }

    if (streak > bestStreak) bestStreak = streak;

    // Update combo dots
    for (let i = 1; i <= 5; i++) {
        const dot = document.getElementById('cd' + i);
        dot.classList.toggle('active', i <= streak);
    }

    document.getElementById('scoreNum').textContent = score;
    document.getElementById('totalNum').textContent = total;
    document.getElementById('bestStreak').textContent = bestStreak;

    // Result overlay
    const overlay = document.getElementById('resultOverlay');
    document.getElementById('resultIcon').textContent = timedOut ? '⏰' : (isCorrect ? '✅' : '❌');
    document.getElementById('resultTitle').textContent = timedOut ? "Time's Up!" : (isCorrect ? 'Correct!' : 'Not Quite!');

    const answerStr = correct.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ');
    document.getElementById('resultMsg').textContent = timedOut
        ? `The answer was: ${answerStr}`
        : (isCorrect ? `You replaced only what was needed!` : `Correct answer: ${answerStr}`);

    document.getElementById('resultTip').textContent = currentSituation.tip;
    document.getElementById('resultBox').style.borderColor = isCorrect ? 'var(--success)' : 'var(--danger)';

    // Confetti on correct
    if (isCorrect) spawnConfetti();

    overlay.classList.add('show');
}

function closeResult() {
    initAudio(); sfxClick();
    document.getElementById('resultOverlay').classList.remove('show');
    currentSituation = null;
    selectedModules = [];
    document.querySelectorAll('.nx-mod').forEach(b => { b.classList.remove('selected'); b.disabled = false; });
    resetTentVisual();
    document.getElementById('btnDraw').disabled = false;
    document.getElementById('btnSubmit').style.display = 'none';
    document.getElementById('timerWrap').classList.remove('active');
    document.getElementById('timerText').textContent = '30';

    const cardInner = document.getElementById('cardInner');
    cardInner.classList.remove('active');
    cardInner.querySelector('.card-front').innerHTML = `
        <div class="card-emoji">🎴</div>
        <p>Draw another card!</p>
    `;
}

// ===== CONFETTI =====
function spawnConfetti() {
    const colors = ['#D4A853', '#4CAF50', '#E8C96E', '#5B8C5A', '#F5E6C8'];
    const container = document.getElementById('resultBox');
    for (let i = 0; i < 25; i++) {
        const conf = document.createElement('div');
        conf.style.cssText = `
            position: absolute; width: 8px; height: 8px; border-radius: 50%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: ${Math.random() * 30}%; left: ${Math.random() * 100}%;
            animation: confetti-fall ${1 + Math.random()}s ease-out forwards;
            animation-delay: ${Math.random() * 0.3}s;
        `;
        container.appendChild(conf);
        setTimeout(() => conf.remove(), 2000);
    }
}

// Init audio on first interaction
document.addEventListener('click', () => initAudio(), { once: true });

// ===== PARTNER TYPE TOGGLE =====
function selectPartnerType(btn) {
    initAudio(); sfxClick();
    document.querySelectorAll('.nx-signup__toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('signupPartnerType').value = btn.dataset.value;
}

// ===== SIGNUP FORM HANDLER =====
function handleSignup(e) {
    e.preventDefault();
    initAudio(); sfxSelect();

    const btn = document.getElementById('signupBtn');
    const btnText = btn.querySelector('.nx-signup__btn-text');
    const btnLoader = btn.querySelector('.nx-signup__btn-loader');

    // Show loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    btn.disabled = true;

    // Simulate network delay
    setTimeout(() => {
        sfxCorrect();

        // Hide form, show success
        document.getElementById('signupForm').style.display = 'none';
        const success = document.getElementById('signupSuccess');
        success.style.display = 'block';

        // Random member number
        const num = String(Math.floor(Math.random() * 9000) + 1000);
        document.getElementById('memberNum').textContent = num;

        // Confetti on success
        const card = document.querySelector('.nx-signup__card');
        const colors = ['#D4A853', '#4CAF50', '#E8C96E', '#5B8C5A', '#F5E6C8'];
        for (let i = 0; i < 30; i++) {
            const conf = document.createElement('div');
            conf.style.cssText = `
                position: absolute; width: 8px; height: 8px; border-radius: 50%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: ${Math.random() * 40}%; left: ${Math.random() * 100}%;
                animation: confetti-fall ${1 + Math.random() * 1.5}s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s; z-index: 10;
            `;
            card.appendChild(conf);
            setTimeout(() => conf.remove(), 3000);
        }
    }, 1800);
}

// Scroll reveal for signup section
const signupObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelector('.nx-signup__card').style.opacity = '1';
            e.target.querySelector('.nx-signup__card').style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.2 });

const signupSection = document.querySelector('.nx-signup');
if (signupSection) {
    const card = signupSection.querySelector('.nx-signup__card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    signupObserver.observe(signupSection);
}
