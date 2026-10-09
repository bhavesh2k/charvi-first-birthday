// Background music control with autoplay on load & gesture fallback
const music = document.querySelector('#music');
const button = document.querySelector('#musicButton');

if (button && music) {
  music.volume = 0.65;

  let hasStarted = false;
  let userPaused = false;

  const updateButtonState = (isPlaying) => {
    if (isPlaying) {
      button.innerHTML = '<span class="note">♫</span> Pause music';
      button.setAttribute('aria-pressed', 'true');
    } else {
      button.innerHTML = '<span class="note">♪</span> Play music';
      button.setAttribute('aria-pressed', 'false');
    }
  };

  const startMusic = async () => {
    if (userPaused) return;
    try {
      await music.play();
      hasStarted = true;
      updateButtonState(true);
      removeInteractionListeners();
    } catch {
      // Browser blocked autoplay without user gesture; wait for first interaction
      updateButtonState(false);
    }
  };

  const onFirstInteraction = () => {
    if (!hasStarted && !userPaused) {
      startMusic();
    }
  };

  const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
  const removeInteractionListeners = () => {
    interactionEvents.forEach((event) => {
      window.removeEventListener(event, onFirstInteraction, { passive: true });
    });
  };

  interactionEvents.forEach((event) => {
    window.addEventListener(event, onFirstInteraction, { passive: true });
  });

  // Try immediate autoplay when DOM/window is ready
  if (document.readyState === 'complete') {
    startMusic();
  } else {
    window.addEventListener('load', startMusic, { once: true });
  }

  // Toggle button click handler
  button.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (music.paused) {
      userPaused = false;
      try {
        await music.play();
        hasStarted = true;
        updateButtonState(true);
      } catch {
        button.textContent = 'Audio unavailable';
      }
    } else {
      userPaused = true;
      music.pause();
      updateButtonState(false);
      removeInteractionListeners();
    }
  });
}

// Lightbox Modal for Photo Gallery
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCap = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

const photos = Array.from(document.querySelectorAll('.month .photo'));
let currentIndex = -1;

function openLightbox(index) {
  if (index < 0 || index >= photos.length) return;
  currentIndex = index;
  const img = photos[currentIndex];
  const article = img.closest('.month');
  const monthText = article?.querySelector('.caption p')?.textContent || '';
  const titleText = article?.querySelector('.caption h3')?.textContent || '';

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || `${monthText} - ${titleText}`;
  lightboxCap.textContent = monthText && titleText ? `${monthText} — ${titleText}` : (monthText || titleText);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showNext() {
  if (photos.length === 0) return;
  openLightbox((currentIndex + 1) % photos.length);
}

function showPrev() {
  if (photos.length === 0) return;
  openLightbox((currentIndex - 1 + photos.length) % photos.length);
}

photos.forEach((photo, idx) => {
  const wrap = photo.closest('.photo-wrap') || photo;
  wrap.addEventListener('click', () => openLightbox(idx));
});

const familyPhoto = document.querySelector('.family-photo');
if (familyPhoto) {
  familyPhoto.addEventListener('click', () => {
    currentIndex = -1;
    lightboxImg.src = familyPhoto.src;
    lightboxImg.alt = familyPhoto.alt || 'Charvi with family';
    lightboxCap.textContent = 'Charvi with family — Our little girl is one!';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
}

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', (e) => {
  e.stopPropagation();
  showPrev();
});
lightboxNext?.addEventListener('click', (e) => {
  e.stopPropagation();
  showNext();
});

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});
