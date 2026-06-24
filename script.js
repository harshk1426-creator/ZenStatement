(() => {
  const slides  = Array.from(document.querySelectorAll('.slide'));
  const nav     = document.getElementById('progressNav');
  const curEl   = document.getElementById('curSlide');
  const totEl   = document.getElementById('totSlide');
  const TOTAL   = slides.length;
  let current   = 0;
  let locked    = false;
  const LOCK_MS = 700;

  totEl.textContent = TOTAL;

  /* progress dots */
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.className = 'pdot';
    b.setAttribute('aria-label', `Slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    nav.appendChild(b);
    return b;
  });

  function activate(idx) {
    slides.forEach((s, i) => {
      s.classList.remove('active','exit-up','exit-dn');
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

  /* wheel */
  let wBuf = 0, wTimer = null;
  window.addEventListener('wheel', e => {
    e.preventDefault();
    wBuf += e.deltaY;
    clearTimeout(wTimer);
    wTimer = setTimeout(() => {
      if (Math.abs(wBuf) > 20) goTo(current + (wBuf > 0 ? 1 : -1));
      wBuf = 0;
    }, 60);
  }, { passive: false });

  /* keyboard */
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End')  { e.preventDefault(); goTo(TOTAL - 1); }
  });

  /* touch */
  let ty = null;
  window.addEventListener('touchstart', e => { ty = e.touches[0].clientY; });
  window.addEventListener('touchend', e => {
    if (ty === null) return;
    const dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) goTo(current + (dy > 0 ? 1 : -1));
    ty = null;
  });

  activate(0);
})();
