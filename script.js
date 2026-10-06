// Background music control
const music = document.querySelector('#music');
const button = document.querySelector('#musicButton');

if (button && music) {
  button.addEventListener('click', async () => {
    if (music.paused) {
      try {
        await music.play();
        button.innerHTML = '<span class="note">♫</span> Pause music';
        button.setAttribute('aria-pressed', 'true');
      } catch {
        button.textContent = 'Add music file first';
      }
    } else {
      music.pause();
      button.innerHTML = '<span class="note">♪</span> Play music';
      button.setAttribute('aria-pressed', 'false');
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
