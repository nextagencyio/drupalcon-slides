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

  // Pause any playing video on the current slide
  const currentVideo = slides[current].querySelector('video');
  if (currentVideo) {
    currentVideo.pause();
    currentVideo.currentTime = 0;
  }

  // Reset overlay on current slide
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

  // Show overlay, start video, fade overlay after 3 seconds
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

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
    case ' ':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      prevSlide();
      break;
  }
});

// Touch swipe support
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  const dy = e.changedTouches[0].screenY - touchStartY;

  // Only register horizontal swipes (ignore vertical scrolls)
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

  if (dx < 0) {
    nextSlide();
  } else {
    prevSlide();
  }
}, { passive: true });

// Click/tap to advance
document.addEventListener('click', () => {
  nextSlide();
});

// Load slide from URL hash on init
const hashMatch = location.hash.match(/^#slide(\d+)$/);
if (hashMatch) {
  const idx = parseInt(hashMatch[1], 10) - 1;
  if (idx >= 0 && idx < slides.length) {
    goToSlide(idx);
  }
} else {
  // Show overlay on first slide, then play video
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
