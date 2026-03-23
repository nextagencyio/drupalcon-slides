const slides = document.querySelectorAll('.slide');
const counter = document.getElementById('slide-counter');
let current = 0;
let overlayTimer = null;

// Build nav dots
const nav = document.getElementById('slide-nav');
const navButtons = [];
slides.forEach((slide, i) => {
  const btn = document.createElement('button');
  btn.textContent = i + 1;
  btn.title = slide.querySelector('.overlay-title')?.textContent || `Slide ${i + 1}`;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide(i);
  });
  nav.appendChild(btn);
  navButtons.push(btn);
});

function updateNav() {
  navButtons.forEach((btn, i) => {
    btn.classList.toggle('active', i === current);
  });
}

function updateCounter() {
  counter.textContent = `${current + 1} / ${slides.length}`;
  updateNav();
}

function goToSlide(index) {
  // Wrap around
  if (index >= slides.length) index = 0;
  if (index < 0) index = slides.length - 1;

  // Pause any playing video
  const currentVideo = slides[current].querySelector('video');
  if (currentVideo) {
    currentVideo.pause();
    currentVideo.currentTime = 0;
  }

  // Reset overlay
  const currentOverlay = slides[current].querySelector('.overlay-title');
  if (currentOverlay) {
    currentOverlay.classList.remove('hidden');
  }

  clearTimeout(overlayTimer);

  slides[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  history.replaceState(null, '', `#slide${current + 1}`);
  updateCounter();

  const video = slides[current].querySelector('video');
  const overlay = slides[current].querySelector('.overlay-title');

  if (video) {
    video.currentTime = 0;
  }

  if (overlay) {
    overlay.classList.remove('hidden');
    overlayTimer = setTimeout(() => {
      overlay.classList.add('hidden');
      if (video) {
        video.play().catch(() => {});
      }
    }, 3000);
  } else if (video) {
    video.play().catch(() => {});
  }
}

function nextSlide() {
  goToSlide(current + 1);
}

function prevSlide() {
  goToSlide(current - 1);
}

// Auto-advance when video ends + progress bar updates
document.querySelectorAll('.video-slide').forEach((slide) => {
  const video = slide.querySelector('video');
  const fill = slide.querySelector('.progress-fill');
  const bar = slide.querySelector('.progress-bar');

  video.addEventListener('ended', () => {
    nextSlide();
  });

  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      fill.style.width = `${(video.currentTime / video.duration) * 100}%`;
    }
  });

  // Click on progress bar to seek
  bar.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
  });
});

// Click/tap to pause-unpause current slide
document.addEventListener('click', (e) => {
  if (e.target.closest('#slide-nav') || e.target.closest('.progress-bar')) return;

  const video = slides[current].querySelector('video');
  if (video) {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      prevSlide();
      break;
    case ' ':
      e.preventDefault();
      const video = slides[current].querySelector('video');
      if (video) {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
      break;
  }
});

// Touch swipe support
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  touchStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  const dy = e.changedTouches[0].screenY - touchStartY;
  const dt = Date.now() - touchStartTime;

  // Horizontal swipe to navigate
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
    return;
  }

  // Short tap = pause/unpause
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) {
    if (e.target.closest('#slide-nav') || e.target.closest('.progress-bar')) return;
    const video = slides[current].querySelector('video');
    if (video) {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }
}, { passive: true });

// Load slide from URL hash on init
const hashMatch = location.hash.match(/^#slide(\d+)$/);
if (hashMatch) {
  const idx = parseInt(hashMatch[1], 10) - 1;
  if (idx >= 0 && idx < slides.length) {
    goToSlide(idx);
  }
} else {
  const firstOverlay = slides[0].querySelector('.overlay-title');
  const firstVideo = slides[0].querySelector('video');
  if (firstOverlay) {
    overlayTimer = setTimeout(() => {
      firstOverlay.classList.add('hidden');
      if (firstVideo) {
        firstVideo.play().catch(() => {});
      }
    }, 3000);
  }
}

updateCounter();
