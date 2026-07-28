// Pepsi Promo Site Main Logic & Audio Synth

document.addEventListener('DOMContentLoaded', () => {

  // -------------------------------------------------------------
  // 1. Audio Synthesizer (Web Audio API)
  // -------------------------------------------------------------
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Generate Can Opening "Pop" & "Psssshhhh" sound synthetically
  function playCanPopSound() {
    if (!isSoundEnabled) return;
    initAudio();

    const now = audioCtx.currentTime;

    // Pop Click sound
    const popOsc = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(300, now);
    popOsc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    popGain.gain.setValueAtTime(1, now);
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    popOsc.connect(popGain);
    popGain.connect(audioCtx.destination);
    popOsc.start(now);
    popOsc.stop(now + 0.08);

    // Hiss / Fizz Noise
    const bufferSize = audioCtx.sampleRate * 0.8;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    whiteNoise.start(now + 0.02);
    whiteNoise.stop(now + 0.7);
  }

  // Play Fizz Pouring sound
  function playFizzPourSound() {
    if (!isSoundEnabled) return;
    initAudio();

    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 1.4);
  }

  // Audio Toggle Element
  const soundToggleBtn = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundIcon.textContent = '🔊';
      soundText.textContent = 'Ovoz: ON';
      playCanPopSound();
    } else {
      soundIcon.textContent = '🔇';
      soundText.textContent = 'Ovoz: OFF';
    }
  });

  // Sound Buttons Triggers
  document.getElementById('playFizzSound').addEventListener('click', () => {
    playCanPopSound();
  });

  document.getElementById('heroSipBtn').addEventListener('click', () => {
    playCanPopSound();
    document.getElementById('heroCan').style.transform = 'scale(1.15) rotate(10deg)';
    setTimeout(() => {
      document.getElementById('heroCan').style.transform = '';
    }, 400);
  });

  // -------------------------------------------------------------
  // 2. Rising Carbonation Bubbles Canvas Background
  // -------------------------------------------------------------
  const canvas = document.getElementById('bubbleCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let bubbles = [];

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Bubble {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 100;
      this.radius = Math.random() * 4 + 1;
      this.speed = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
      this.y -= this.speed;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.5;

      if (this.y < -10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 1.2})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  for (let i = 0; i < 60; i++) {
    bubbles.push(new Bubble());
  }

  function animateBubbles() {
    ctx.clearRect(0, 0, width, height);
    bubbles.forEach(b => {
      b.update();
      b.draw();
    });
    requestAnimationFrame(animateBubbles);
  }
  animateBubbles();

  // -------------------------------------------------------------
  // 3. Header Scrolled Styling & Navigation
  // -------------------------------------------------------------
  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // -------------------------------------------------------------
  // 4. Product Gallery Filter & Modals
  // -------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const productCards = document.querySelectorAll('.product-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      productCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Product Modal Setup
  const productModal = document.getElementById('productModal');
  const closeProdModal = document.getElementById('closeProdModal');
  const viewDetailsBtns = document.querySelectorAll('.view-details-btn');

  viewDetailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const desc = btn.getAttribute('data-desc');
      const cal = btn.getAttribute('data-calories');
      const caffeine = btn.getAttribute('data-caffeine');

      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalDesc').textContent = desc;
      document.getElementById('modalCal').textContent = cal;
      document.getElementById('modalCaffeine').textContent = caffeine;

      productModal.classList.add('active');
    });
  });

  closeProdModal.addEventListener('click', () => {
    productModal.classList.remove('active');
  });

  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) productModal.classList.remove('active');
  });

  // -------------------------------------------------------------
  // 5. Interactive Flavor Mixer Logic
  // -------------------------------------------------------------
  const iceRange = document.getElementById('iceRange');
  const fizzRange = document.getElementById('fizzRange');
  const iceVal = document.getElementById('iceVal');
  const fizzVal = document.getElementById('fizzVal');
  const iceContainer = document.getElementById('iceContainer');
  const glassLiquid = document.getElementById('glassLiquid');
  const customDrinkName = document.getElementById('customDrinkName');
  const pourDrinkBtn = document.getElementById('pourDrinkBtn');
  const flavorBtns = document.querySelectorAll('.flavor-opt-btn');

  let currentFlavor = 'Klassik';

  iceRange.addEventListener('input', (e) => {
    const count = parseInt(e.target.value);
    iceVal.textContent = `${count} KUB`;
    updateIceCubes(count);
  });

  fizzRange.addEventListener('input', (e) => {
    const val = e.target.value;
    fizzVal.textContent = `${val}%`;
  });

  flavorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      flavorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFlavor = btn.textContent;
      updateDrinkBadge();
    });
  });

  function updateIceCubes(count) {
    iceContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const cube = document.createElement('div');
      cube.className = 'ice-cube';
      cube.style.top = `${15 + i * 18}%`;
      cube.style.left = `${15 + (i % 2) * 35}%`;
      cube.style.animationDelay = `${i * 0.2}s`;
      iceContainer.appendChild(cube);
    }
  }

  function updateDrinkBadge() {
    customDrinkName.textContent = `Pepsi ${currentFlavor} Mix ⚡`;
  }

  pourDrinkBtn.addEventListener('click', () => {
    playFizzPourSound();
    glassLiquid.style.height = '0%';
    setTimeout(() => {
      glassLiquid.style.height = '85%';
    }, 200);
  });

  // -------------------------------------------------------------
  // 6. Campaign Contest Countdown Timer
  // -------------------------------------------------------------
  let festivalDate = new Date();
  festivalDate.setDate(festivalDate.getDate() + 14);

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = festivalDate - now;

    if (diff < 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cdDays').textContent = days < 10 ? '0' + days : days;
    document.getElementById('cdHours').textContent = hours < 10 ? '0' + hours : hours;
    document.getElementById('cdMins').textContent = mins < 10 ? '0' + mins : mins;
    document.getElementById('cdSecs').textContent = secs < 10 ? '0' + secs : secs;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Promo Code Modal
  const promoModal = document.getElementById('promoModal');
  const openPromoModal = document.getElementById('openPromoModal');
  const closePromoModal = document.getElementById('closePromoModal');
  const submitPromoBtn = document.getElementById('submitPromoBtn');
  const promoInput = document.getElementById('promoInput');
  const promoResult = document.getElementById('promoResult');

  openPromoModal.addEventListener('click', () => {
    promoModal.classList.add('active');
  });

  closePromoModal.addEventListener('click', () => {
    promoModal.classList.remove('active');
  });

  submitPromoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim();
    if (code.length >= 4) {
      playCanPopSound();
      promoResult.style.color = '#00f0ff';
      promoResult.textContent = '🎉 TABRIKLAYMIZ! Promokod qabul qilindi. Siz Pepsi Music Fest 2026 o\'yinida qatnashyapsiz!';
    } else {
      promoResult.style.color = '#eb1923';
      promoResult.textContent = '⚠️ Iltimos, kamida 4 belgidan iborat promokodni kiriting!';
    }
  });

});
