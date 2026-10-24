(() => {
  const $ = id => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const celebration = document.querySelector('.countdown-section');
  const celebrateButton = $('celebrate-countdown');
  let lastCelebration = -Infinity;
  function scatterJoy() {
    if (reducedMotion.matches || performance.now() - lastCelebration < 1200) return;
    lastCelebration = performance.now();
    const layer = celebration.querySelector('.celebration-confetti');
    const colors = ['#b67b8c','#c5a85a','#d49da9','#9aaf8b'];
    for (let i = 0; i < 22; i++) {
      const piece = document.createElement('span');
      piece.className = 'joy-particle';
      piece.textContent = ['♡','✦','♥','·'][i % 4];
      piece.style.setProperty('--x', `${12 + Math.random() * 76}%`);
      piece.style.setProperty('--y', `${62 + Math.random() * 30}%`);
      piece.style.setProperty('--color', colors[i % colors.length]);
      piece.style.setProperty('--size', `${9 + Math.random() * 9}px`);
      piece.style.setProperty('--drift', `${(Math.random() - .5) * 120}px`);
      piece.style.setProperty('--spin', `${(Math.random() - .5) * 160}deg`);
      piece.style.setProperty('--delay', `${Math.random() * .35}s`);
      piece.addEventListener('animationend', () => piece.remove(), {once:true});
      layer.appendChild(piece);
    }
  }
  celebrateButton.addEventListener('click', scatterJoy);
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const joyObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { scatterJoy(); joyObserver.disconnect(); }
    }, {threshold:.55});
    joyObserver.observe(celebration);
  }
  const guest = new URLSearchParams(location.search).get('guest');
  if (guest && guest.trim()) {
    $('guest-greeting').textContent = `${guest.trim().slice(0, 80)}، تكتمل فرحتنا بحضوركم`;
    $('guest-greeting').hidden = false;
  }
  const ornament = '<svg viewBox="0 0 100 170" aria-hidden="true"><path d="M48 160C30 112 72 65 48 10M46 133L20 113M48 108L78 86M52 77L26 54M53 49L72 27"/><g><ellipse cx="21" cy="109" rx="7" ry="18" transform="rotate(-48 21 109)"/><ellipse cx="75" cy="86" rx="7" ry="18" transform="rotate(45 75 86)"/><ellipse cx="28" cy="55" rx="7" ry="17" transform="rotate(-44 28 55)"/><ellipse cx="69" cy="29" rx="6" ry="15" transform="rotate(35 69 29)"/><ellipse cx="47" cy="16" rx="5" ry="13" transform="rotate(-12 47 16)"/></g></svg>';
  ['right','left'].forEach(side => {
    const branch = document.createElement('div');
    branch.className = `botanical botanical-${side}`;
    branch.setAttribute('aria-hidden','true');
    branch.innerHTML = ornament;
    document.querySelector('.hero').appendChild(branch);
  });
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:0,rootMargin:'0px 0px -35px 0px'});
    document.querySelectorAll('.app-container > section:not(.countdown-section)').forEach(section => {
      section.classList.add('reveal-pending'); observer.observe(section);
    });
  }
  const music = $('bg-music'), musicButton = $('toggle-music');
  function updateMusicButton() {
    const playing = !music.paused;
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى');
    musicButton.title = playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى';
    musicButton.innerHTML = `<i aria-hidden="true" class="ph ${playing ? 'ph-speaker-high' : 'ph-speaker-slash'}"></i>`;
  }
  musicButton.addEventListener('click', () => {
    if (music.paused) music.play().catch(() => { $('toast').textContent='تعذّر تشغيل الموسيقى'; $('toast').classList.add('show'); setTimeout(()=>$('toast').classList.remove('show'),2600); });
    else music.pause();
  });
  music.addEventListener('play',updateMusicButton); music.addEventListener('pause',updateMusicButton); updateMusicButton();
  let scheduled = false;
  function updateProgress() {
    const height = document.documentElement.scrollHeight - innerHeight;
    $('reading-progress').style.width = `${height > 0 ? Math.min(100,scrollY / height * 100) : 0}%`;
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, {passive:true});
  addEventListener('resize',updateProgress); updateProgress();
})();
