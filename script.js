// Web Audio API Music Box synthesizer for Happy Birthday
class BirthdayMusicBox {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timeoutId = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, time, duration = 1.2, volume = 0.25) {
    if (!this.ctx || freq <= 0) return;
    const now = time;

    // Fundamental oscillator (sine wave for warm bell tone)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Overtone oscillator for chime / music box sparkle (harmonic tine)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // Envelopes: instantaneous attack, smooth exponential decay
    gain1.gain.setValueAtTime(volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    gain2.gain.setValueAtTime(volume * 0.35, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);

    osc1.connect(gain1);
    osc2.connect(gain2);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Master gain with gentle stereo echo / ambient delay
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.38, this.ctx.currentTime);

    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.24, this.ctx.currentTime);
    const delayGain = this.ctx.createGain();
    delayGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(this.ctx.destination);
    delayGain.connect(delay);

    this.scheduleSong();
  }

  stop() {
    this.isPlaying = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.ctx) {
      this.ctx.suspend();
    }
  }

  scheduleSong() {
    if (!this.isPlaying) return;

    // Note frequencies in Hz
    const N = {
      REST: 0,
      F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63,
      D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00,
      Bb4: 466.16, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46
    };

    const tempo = 96; // BPM (gentle music box waltz)
    const beatSec = 60 / tempo; // ~0.625s per beat
    const startTime = this.ctx.currentTime + 0.1;

    // Arrangement: [beatOffset, melodyNote, durationBeats, volume, [accompanyingChimes]]
    const melody = [
      // Measure 1: "Hap-py birth-day to"
      [0.0,   N.C4,  0.75, 0.35, [N.F3]],
      [0.75,  N.C4,  0.25, 0.28, []],
      [1.0,   N.D4,  1.0,  0.35, [N.A3]],
      [2.0,   N.C4,  1.0,  0.35, [N.C4]],

      // Measure 2: "you..."
      [3.0,   N.F4,  1.0,  0.40, [N.A3]],
      [4.0,   N.E4,  2.0,  0.38, [N.C4, N.G3]],

      // Measure 3: "Hap-py birth-day to"
      [6.0,   N.C4,  0.75, 0.35, [N.C4]],
      [6.75,  N.C4,  0.25, 0.28, []],
      [7.0,   N.D4,  1.0,  0.35, [N.E3]],
      [8.0,   N.C4,  1.0,  0.35, [N.G3]],

      // Measure 4: "you..."
      [9.0,   N.G4,  1.0,  0.40, [N.E4]],
      [10.0,  N.F4,  2.0,  0.40, [N.F3, N.A3]],

      // Measure 5: "Hap-py birth-day dear"
      [12.0,  N.C4,  0.75, 0.35, [N.F3]],
      [12.75, N.C4,  0.25, 0.28, []],
      [13.0,  N.C5,  1.0,  0.42, [N.A4]],
      [14.0,  N.A4,  1.0,  0.38, [N.F4]],

      // Measure 6: "Char-vi..."
      [15.0,  N.F4,  1.0,  0.38, [N.D4]],
      [16.0,  N.E4,  1.0,  0.35, [N.C4]],
      [17.0,  N.D4,  1.0,  0.35, [N.Bb3]],

      // Measure 7: "Hap-py birth-day to"
      [18.0,  N.Bb4, 0.75, 0.38, [N.D4]],
      [18.75, N.Bb4, 0.25, 0.30, []],
      [19.0,  N.A4,  1.0,  0.38, [N.F4]],
      [20.0,  N.F4,  1.0,  0.35, [N.C4]],

      // Measure 8: "you!"
      [21.0,  N.G4,  1.0,  0.38, [N.C4]],
      [22.0,  N.F4,  2.5,  0.42, [N.F3, N.A3, N.C4]]
    ];

    const totalBeats = 26; // 8 measures + gentle pause
    const totalDurationSec = totalBeats * beatSec;

    melody.forEach(([offset, note, durBeats, vol, accNotes]) => {
      const noteTime = startTime + offset * beatSec;
      const noteDur = Math.max(durBeats * beatSec * 1.5, 0.8);
      this.playTone(note, noteTime, noteDur, vol);

      if (accNotes && accNotes.length) {
        accNotes.forEach((accNote) => {
          this.playTone(accNote, noteTime, noteDur * 1.2, vol * 0.45);
        });
      }
    });

    // Loop after song finishes
    this.timeoutId = setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleSong();
      }
    }, totalDurationSec * 1000);
  }
}

const musicBox = new BirthdayMusicBox();
const button = document.querySelector('#musicButton');

if (button) {
  button.addEventListener('click', () => {
    if (!musicBox.isPlaying) {
      musicBox.start();
      button.innerHTML = '<span class="note">♫</span> Pause music';
      button.setAttribute('aria-pressed', 'true');
    } else {
      musicBox.stop();
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
