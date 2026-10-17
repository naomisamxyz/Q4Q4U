// decode.js — types text out like code, with scrambling symbols
(function () {

    const SCR = '✧☆❦❤︎𝓠☀︎♡꩜➻✦𝟺𝟶𝟷𝟶𝟷𝟶𝟷𝟶𝟷𝟶𝟷𝟶𝟷d∞*.~∴∵';

    // Important: correctly separates Unicode symbols
    const SYMBOLS = [...SCR];

    function hsh(i) {
        const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x);
    }

    function decode(el, opts = {}) {

        const perChar  = opts.perChar ?? 0.01;
        const scramble = opts.scramble ?? 0.1;
        const tick     = opts.tick ?? 14;
        const order    = opts.order ?? 'seq';
        const cursor   = opts.cursor ?? true;

        const chars = [...el.textContent];
        const total = chars.length;

        const duration =
            opts.duration ?? Math.max(0.5, total * perChar);

        el.setAttribute('aria-label', el.textContent);
        el.textContent = '';

        // Create one span for every character
        const spans = chars.map(() => {
            const s = document.createElement('span');
            s.setAttribute('aria-hidden', 'true');
            el.appendChild(s);
            return s;
        });

        // Cursor
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

                // Spaces
                if (ch === ' ') {
                    s.textContent = ' ';
                    return;
                }

                const k =
                    order === 'random'
                        ? hsh(i) * (total - 1)
                        : i;

                const start =
                    k / Math.max(1, total - 1) * (1 - scramble);

                const r = (u - start) / scramble;

                if (r <= 0) {

                    // Not reached yet
                    s.textContent = ch;
                    s.classList.remove('scrambling');
                    s.style.visibility = 'hidden';

                } else if (r < 1 && u < 1) {

                    // Scrambling symbol
                    const symbolIndex = Math.floor(
                        hsh(i + tk * 7.1) * SYMBOLS.length
                    );

                    s.textContent = SYMBOLS[symbolIndex];
                    s.classList.add('scrambling');
                    s.style.visibility = 'visible';

                } else {

                    // Finished character
                    s.textContent = ch;
                    s.classList.remove('scrambling');
                    s.style.visibility = 'visible';
                }
            });

            // Blink cursor
            if (cur) {
                cur.style.visibility =
                    Math.floor(now * 3) % 2
                        ? 'hidden'
                        : 'visible';
            }

            if (u < 1) {
                requestAnimationFrame(frame);
            } else if (cur) {
                cur.remove();
            }
        }

        requestAnimationFrame(frame);
    }


    function init(root = document) {

        // Make copies of elements marked data-layers="N"
        root.querySelectorAll('[data-layers]').forEach(layer => {

            const n =
                parseInt(layer.dataset.layers, 10) || 1;

            for (let i = 1; i < n; i++) {

                const copy = layer.cloneNode(true);

                copy.setAttribute(
                    'aria-hidden',
                    'true'
                );

                copy.removeAttribute('data-layers');

                layer.after(copy);
            }
        });


        // Start decode animations
        root.querySelectorAll('[data-decode]').forEach(el => {

            if (el.dataset.speed === 'slow') {

                decode(el, {
                    perChar: 0.1,
                    scramble: 0.6,
                    tick: 16
                });

            } else {

                decode(el, {
                    perChar: 0.01,
                    scramble: 0.1,
                    tick: 16
                });
            }
        });
    }


    init();

    window.decode = decode;
    window.initDecode = init;

})();