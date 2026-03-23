const slides = document.querySelectorAll('.slide');
const counter = document.getElementById('slide-counter');
let current = 0;
let titleTimer = null;

function updateCounter() {
  counter.textContent = `${current + 1} / ${slides.length}`;
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

  slides[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  history.replaceState(null, '', `#slide${current + 1}`);
  updateCounter();

  // Clear any pending title timer
  clearTimeout(titleTimer);

  // If the new slide has a video, autoplay it
  const video = slides[current].querySelector('video');
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  // Auto-advance title slides after 3 seconds
  if (slides[current].dataset.type === 'title') {
    titleTimer = setTimeout(nextSlide, 3000);
  }
}

function nextSlide() {
  goToSlide(current + 1);
}

function prevSlide() {
  goToSlide(current - 1);
}

// Auto-advance when video ends
document.querySelectorAll('.video-slide video').forEach((video) => {
  video.addEventListener('ended', () => {
    nextSlide();
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

// Click/tap to advance (only non-swipe taps)
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
}

updateCounter();
