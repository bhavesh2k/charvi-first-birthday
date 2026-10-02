const music = document.querySelector('#music');
const button = document.querySelector('#musicButton');
button.addEventListener('click', async () => {
  if (music.paused) {
    try { await music.play(); button.innerHTML = '<span class="note">♫</span> Pause music'; button.setAttribute('aria-pressed', 'true'); }
    catch { button.textContent = 'Add music file first'; }
  } else { music.pause(); button.innerHTML = '<span class="note">♪</span> Play music'; button.setAttribute('aria-pressed', 'false'); }
});
