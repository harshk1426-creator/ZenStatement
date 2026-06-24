(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const nav    = document.getElementById('progressNav');
  const hint   = document.getElementById('kbdHint');
  const curEl  = document.getElementById('currentNum');
  const totEl  = document.getElementById('totalNum');
  const TOTAL  = slides.length;

  let current    = 0;
  let locked     = false;
  const LOCK_MS  = 750;

  /* ── build progress dots ── */
  totEl.textContent = TOTAL;
  const dots = slides.map((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'pdot';
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    nav.appendChild(btn);
    return btn;
  });

  /* ── activate a slide ── */
  function activate(idx) {
    slides.forEach((s, i) => {
      s.classList.remove('active', 'exit-up', 'exit-dn');
      if (i < idx) s.classList.add('exit-up');
      if (i > idx) s.classList.add('exit-dn');
    });
    slides[idx].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    curEl.textContent = idx + 1;
    current = idx;
  }

  function goTo(idx) {
    if (locked || idx === current || idx < 0 || idx >= TOTAL) return;
    locked = true;
    activate(idx);
    setTimeout(() => { locked = false; }, LOCK_MS);
  }

  /* ── wheel scroll (debounced) ── */
  let wheelBuffer = 0;
  let wheelTimer  = null;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelBuffer += e.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      if (Math.abs(wheelBuffer) > 30) {
        goTo(current + (wheelBuffer > 0 ? 1 : -1));
      }
      wheelBuffer = 0;
    }, 50);
  }, { passive: false });

  /* ── keyboard ── */
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown': case 'PageDown': e.preventDefault(); goTo(current + 1); break;
      case 'ArrowUp':   case 'PageUp':  e.preventDefault(); goTo(current - 1); break;
      case 'Home': e.preventDefault(); goTo(0);         break;
      case 'End':  e.preventDefault(); goTo(TOTAL - 1); break;
    }
  });

  /* ── touch swipe ── */
  let touchY = null;
  window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; });
  window.addEventListener('touchend', (e) => {
    if (touchY === null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) goTo(current + (dy > 0 ? 1 : -1));
    touchY = null;
  });

  /* ── hide hint after first interaction ── */
  let hintHidden = false;
  function hideHint() {
    if (!hintHidden) { hintHidden = true; hint.classList.add('hidden'); }
  }
  ['wheel','keydown','touchend'].forEach(ev => window.addEventListener(ev, hideHint, { once: false }));
  setTimeout(() => hint.classList.add('hidden'), 5000);

  /* ── init ── */
  activate(0);
})();
