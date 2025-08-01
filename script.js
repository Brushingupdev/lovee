(() => {
  // Canvas setup for hearts animation
  const canvas = document.getElementById('heartsCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const hearts = [];
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const maxHearts = isMobile ? 8 : 15;

  function createHeart() {
    return {
      x: Math.random() * canvasWidth,
      y: canvasHeight,
      size: Math.random() * (isMobile ? 6 : 8) + 4,
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.2,
      sway: Math.random() * (isMobile ? 1 : 1.5) + 0.5,
    };
  }

  function drawHeart(heart) {
    ctx.beginPath();
    ctx.moveTo(heart.x, heart.y - heart.size / 2);
    ctx.bezierCurveTo(
      heart.x + heart.size / 2, heart.y - heart.size,
      heart.x + heart.size, heart.y + heart.size / 2,
      heart.x, heart.y + heart.size
    );
    ctx.bezierCurveTo(
      heart.x - heart.size, heart.y + heart.size / 2,
      heart.x - heart.size / 2, heart.y - heart.size,
      heart.x, heart.y - heart.size / 2
    );
    ctx.fillStyle = `rgba(255, 105, 180, ${heart.opacity})`;
    ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
    ctx.shadowBlur = isMobile ? 3 : 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function animateHearts(timestamp) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (hearts.length < maxHearts && Math.random() < 0.1) {
      hearts.push(createHeart());
    }
    hearts.forEach((heart, index) => {
      heart.y -= heart.speed;
      heart.x += Math.sin(heart.y / 30 + timestamp / 1000) * heart.sway;
      if (heart.y < -heart.size) {
        hearts.splice(index, 1);
      } else {
        drawHeart(heart);
      }
    });
    requestAnimationFrame(animateHearts);
  }

  // Audio control
  const audio = document.getElementById('player');
  const toggleAudio = document.getElementById('toggleAudio');
  const volumeSlider = document.getElementById('volumeSlider');

  function setupAudio() {
    audio.volume = parseFloat(volumeSlider.value);
    audio.play().catch(err => console.warn('Autoplay blocked:', err));
    toggleAudio.textContent = audio.paused ? '🔇' : '🔊';

    toggleAudio.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(err => console.warn('Playback failed:', err));
        toggleAudio.textContent = '🔊';
      } else {
        audio.pause();
        toggleAudio.textContent = '🔇';
      }
    });

    volumeSlider.addEventListener('input', () => {
      audio.volume = parseFloat(volumeSlider.value);
    });
  }

  // Cube control
  const cuboGrande = document.querySelector('.cubo-grande');
  const cuboPequeno = document.querySelector('.cubo-pequeno');
  let isPaused = false;
  let animationStartTime = null;

  function toggleCubeAnimation() {
    isPaused = !isPaused;
    cuboGrande.style.animationPlayState = isPaused ? 'paused' : 'running';
    cuboPequeno.style.animationPlayState = isPaused ? 'paused' : 'running';
    cuboGrande.setAttribute('aria-label', isPaused ? 'Reanudar cubo de recuerdos grandes' : 'Pausar cubo de recuerdos grandes');
    // Update animation start time to maintain continuity
    animationStartTime = isPaused ? null : performance.now();
  }

  function preserveCubeAnimation() {
    if (!isPaused) {
      // Ensure animation continues by forcing a repaint
      cuboGrande.style.animationPlayState = 'running';
      cuboPequeno.style.animationPlayState = 'running';
      // Trigger a minimal repaint
      void cuboGrande.offsetWidth;
    }
  }

  cuboGrande.addEventListener('click', toggleCubeAnimation);
  cuboGrande.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCubeAnimation();
    }
  });

  // Touch swipe for cube rotation on mobile
  let touchStartX = 0;
  let touchStartY = 0;
  cuboGrande.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  cuboGrande.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      toggleCubeAnimation();
    }
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightbox = document.querySelector('.close-lightbox');
  const caras = document.querySelectorAll('.cara img');

  function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.style.display = 'flex';
    // Ensure cube animation continues unless user-paused
    preserveCubeAnimation();
    lightbox.focus();
  }

  function closeLightboxFunc() {
    lightbox.style.display = 'none';
    // Restore cube animation state
    preserveCubeAnimation();
    cuboGrande.focus();
  }

  caras.forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    });
  });

  closeLightbox.addEventListener('click', closeLightboxFunc);
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLightboxFunc();
    }
  });

  // Resize handler
  function handleResize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  window.addEventListener('resize', handleResize);

  // Initialize
  setupAudio();
  animationStartTime = performance.now();
  requestAnimationFrame(animateHearts);
})();