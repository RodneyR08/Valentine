document.addEventListener('DOMContentLoaded', () => {
  // ============================
  // ELEMENTS
  // ============================
  const bgMusic = document.getElementById('bg-music');
  const hero = document.getElementById('hero');
  const storySection = document.getElementById('story');
  const memoriesSection = document.getElementById('memories');
  const videoSection = document.getElementById('video-section');
  const questionSection = document.getElementById('question');
  const video = document.getElementById('love-video');
  video.muted = true;
  const videoOverlay = document.getElementById('video-overlay');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const finalMessage = document.getElementById('final-message');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const floatingHeartsContainer = document.getElementById('floating-hearts');
  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  let musicStarted = false;
  let videoPlaying = false;
  let heartsPaused = false;

  // ============================
  // BACKGROUND MUSIC
  // ============================
  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(() => {});
  }

  // ============================
  // FLOATING HEARTS (page-wide, romantic)
  // ============================
  const heartChars = ['\u2665', '\u2764', '\u2661', '\u2763'];

  function spawnHeart() {
    if (heartsPaused) return;

    const heart = document.createElement('span');
    heart.classList.add('floating-heart');
    heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 14 + 10) + 'px';

    // Slower, more romantic timing
    const duration = Math.random() * 8 + 12;
    heart.style.animationDuration = duration + 's';
    heart.style.animationDelay = (Math.random() * 3) + 's';

    // Slight horizontal drift variation via custom property
    const driftX = (Math.random() - 0.5) * 30;
    heart.style.setProperty('--drift-x', driftX + 'px');

    floatingHeartsContainer.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  }

  // Low-density spawning — one heart every ~2.5s
  let heartInterval = setInterval(spawnHeart, 2500);

  // Spawn a few gently at start
  for (let i = 0; i < 3; i++) {
    setTimeout(spawnHeart, i * 1200);
  }

  function pauseHearts() {
    heartsPaused = true;
  }

  function resumeHearts() {
    heartsPaused = false;
  }

  // ============================
  // HERO TAP INTERACTION
  // ============================
  hero.addEventListener('click', () => {
    startMusic();
    hero.style.transition = 'opacity 1s cubic-bezier(0.25, 0.1, 0.25, 1)';
    hero.style.opacity = '0';
    hero.style.pointerEvents = 'none';
    setTimeout(() => {
      storySection.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  });

  // ============================
  // INTERSECTION OBSERVER FACTORY
  // ============================
  function createObserver(options = {}) {
    const { threshold = 0.2, rootMargin = '0px', once = true } = options;
    return new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (once) observer.unobserve(entry.target);
        }
      });
    }, { threshold, rootMargin });
  }

  // ============================
  // STORY LINES — STAGGERED REVEAL
  // ============================
  const storyLines = document.querySelectorAll('.story-line');
  const storyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });

  storyLines.forEach(line => storyObserver.observe(line));

  // ============================
  // SECTION HEADINGS REVEAL
  // ============================
  const headings = document.querySelectorAll('.section-heading');
  const headingObserver = createObserver({ threshold: 0.5 });
  headings.forEach(h => headingObserver.observe(h));

  // ============================
  // PHOTO CARDS — STAGGERED REVEAL + DRIFT
  // ============================
  const photoCards = document.querySelectorAll('.photo-card');
  const photoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
          // Start drift animation after reveal completes
          setTimeout(() => {
            entry.target.classList.add('drifting');
            // Each card gets slightly different drift timing
            entry.target.style.setProperty('--drift-duration', (7 + idx * 1.5) + 's');
            entry.target.style.setProperty('--drift-delay', (idx * 0.8) + 's');
          }, 1200);
        }, idx * 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

  photoCards.forEach(card => photoObserver.observe(card));

  // ============================
  // PHOTO TAP — LIGHTBOX
  // ============================
  photoCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
      }
    });
  });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  // ============================
  // VIDEO SECTION
  // ============================
  const videoWrapper = document.querySelector('.video-wrapper');
  const videoWrapperObserver = createObserver({ threshold: 0.3 });
  videoWrapperObserver.observe(videoWrapper);

  // Auto-play muted when in view
  const videoAutoplayObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.muted = true;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });
  videoAutoplayObserver.observe(videoWrapper);

  // Tap to play with sound
  videoOverlay.addEventListener('click', () => {
    videoOverlay.classList.add('hidden');
    video.muted = true;
    video.currentTime = 0;
    video.play().catch(() => {});
    videoPlaying = true;
    pauseHearts();
    if (musicStarted) {
      bgMusic.volume = 0.1;
    }
  });

  video.addEventListener('ended', () => {
    videoOverlay.classList.remove('hidden');
    videoPlaying = false;
    resumeHearts();
    if (musicStarted) {
      bgMusic.volume = 0.3;
    }
  });

  video.addEventListener('pause', () => {
    if (video.ended) return;
    if (!video.muted) {
      videoOverlay.classList.remove('hidden');
      videoPlaying = false;
      resumeHearts();
      if (musicStarted) {
        bgMusic.volume = 0.3;
      }
    }
  });

  // ============================
  // QUESTION SECTION
  // ============================
  const questionTitle = document.querySelector('.question-title');
  const questionObserver = createObserver({ threshold: 0.5 });
  questionObserver.observe(questionTitle);

  // ============================
  // NO BUTTON — DODGE MECHANIC
  // ============================
  let noClickCount = 0;
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    noClickCount++;

    const messages = [
      'Are you sure?',
      'Really?',
      'Think again...',
      'Not an option!',
      'Try the other one!'
    ];

    btnNo.textContent = messages[Math.min(noClickCount - 1, messages.length - 1)];

    const containerRect = btnNo.parentElement.getBoundingClientRect();
    const maxX = containerRect.width - btnNo.offsetWidth;
    const randomX = (Math.random() - 0.5) * maxX * 0.8;
    const randomY = (Math.random() - 0.5) * 80;

    btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;

    const scale = 1 + noClickCount * 0.05;
    btnYes.style.transform = `scale(${Math.min(scale, 1.3)})`;
  });

  // ============================
  // YES BUTTON — CELEBRATION
  // ============================
  btnYes.addEventListener('click', () => {
    document.body.classList.add('celebration');
    finalMessage.classList.add('visible');

    // Burst of floating hearts
    for (let i = 0; i < 15; i++) {
      setTimeout(spawnHeart, i * 150);
    }

    launchConfetti();

    setTimeout(() => {
      finalMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
  });

  // ============================
  // CONFETTI SYSTEM
  // ============================
  function launchConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#d4af37', '#f4c2c2', '#ff6b6b', '#ffd700', '#ff69b4', '#ffffff'];
    const shapes = ['circle', 'rect', 'heart'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1
      });
    }

    let frame = 0;
    const maxFrames = 200;

    function animate() {
      if (frame > maxFrames) {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        return;
      }

      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.rotation += p.rotationSpeed;

        if (frame > maxFrames * 0.7) {
          p.opacity = Math.max(0, 1 - (frame - maxFrames * 0.7) / (maxFrames * 0.3));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          drawHeart(ctx, 0, 0, p.size);
        }

        ctx.restore();
      });

      frame++;
      requestAnimationFrame(animate);
    }

    function drawHeart(ctx, x, y, size) {
      ctx.beginPath();
      const s = size * 0.5;
      ctx.moveTo(x, y + s * 0.4);
      ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.4);
      ctx.bezierCurveTo(x - s, y + s * 0.8, x, y + s * 1.2, x, y + s * 1.4);
      ctx.bezierCurveTo(x, y + s * 1.2, x + s, y + s * 0.8, x + s, y + s * 0.4);
      ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.4);
      ctx.fill();
    }

    animate();
  }

  // ============================
  // SUBTLE PARALLAX ON SCROLL
  // ============================
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const blooms = document.querySelectorAll('.bg-bloom');
        blooms.forEach((bloom, i) => {
          const speed = 0.02 + i * 0.01;
          bloom.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  // Handle canvas resize
  window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });
});
