// decode.js — types text out like code, with scrambling symbols
(function () {
  const SCR = '0123456789ABCDEFabcdef#%@*+=:-.;/\\<>|{}[]()$&!?~^_01010110';

  function hsh(i) {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

    function decode(el, opts = {}) {
    const perChar  = opts.perChar ?? 0.01;  // seconds per character
    const scramble = opts.scramble ?? 0.2; // how long each character scrambles
    const tick     = opts.tick ?? 14;       // symbol flicker speed
    const order    = opts.order ?? 'seq';   // 'seq' or 'random'
    const cursor   = opts.cursor ?? true;   // blinking block cursor

    const chars = [...el.textContent];
    const total = chars.length;
    const duration = opts.duration ?? Math.max(0.5, total * perChar);
    el.setAttribute('aria-label', el.textContent);
    el.textContent = '';

    const spans = chars.map(() => {
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
      return s;
    });

    let cur = null;
    if (cursor) {
      cur = document.createElement('span');
      cur.textContent = '█';
      cur.setAttribute('aria-hidden', 'true');
      el.appendChild(cur);
    }

    const t0 = performance.now();

    function frame(t) {
      const now = (t - t0) / 1000;
      const u = Math.min(1, now / duration);
      const tk = Math.floor(now * tick);

      chars.forEach((ch, i) => {
        const s = spans[i];
        if (ch === ' ') { s.textContent = ' '; return; }
        const k = order === 'random' ? hsh(i) * (total - 1) : i;
        const start = k / Math.max(1, total - 1) * (1 - scramble);
        const r = (u - start) / scramble;

        if (r <= 0) {                 // not reached yet: invisible, but keeps its space
          s.textContent = ch;
          s.style.visibility = 'hidden';
        } else if (r < 1 && u < 1) {  // decoding: random symbol          s.textContent = SCR[Math.floor(hsh(i + tk * 7.1) * SCR.length)];
          s.style.visibility = 'visible';
        } else {                      // done: real character
          s.textContent = ch;
          s.style.visibility = 'visible';
        }
      });

      if (cur) cur.style.visibility = Math.floor(now * 3) % 2 ? 'hidden' : 'visible';

      if (u < 1) requestAnimationFrame(frame);
      else if (cur) cur.remove();
    }

    requestAnimationFrame(frame);
  }

    // make copies of any element marked data-layers="N"
  document.querySelectorAll('[data-layers]').forEach(layer => {
    const n = parseInt(layer.dataset.layers, 10) || 1;
    for (let i = 1; i < n; i++) {
      const copy = layer.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.removeAttribute('data-layers');
      layer.after(copy);
    }
  });

  document.querySelectorAll('[data-decode]').forEach(el => decode(el));
  window.decode = decode;
})();