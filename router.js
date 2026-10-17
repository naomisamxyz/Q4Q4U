// router.js — swaps only <main> when you click a link,
// so the background and everything else keeps running

(function () {

    async function load(url, push) {
        try {
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(res.status);
            }

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const newMain = doc.querySelector('main');
            const main = document.querySelector('main');

            if (!newMain || !main) {
                throw new Error('no <main>');
            }

            // Replace only the main content
            main.replaceWith(newMain);

            // Update page title
            document.title = doc.title;

            // Update browser history
            if (push) {
                history.pushState({}, '', url);
            }

            // Scroll back to top
            window.scrollTo(0, 0);


            // -------------------------
            // RE-INITIALIZE PAGE SCRIPTS
            // -------------------------

            // Typing / decode effect
            if (window.initDecode) {
                window.initDecode(newMain);
            }

            // Q video
            // If the new page contains #q-video,
            // this resets it to the first idle animation.
            if (window.initQVideo) {
                window.initQVideo();
            }


        } catch (err) {

            // If router fails, use normal page navigation
            location.href = url;
        }
    }


    // -------------------------
    // LINK CLICKS
    // -------------------------

    document.addEventListener('click', e => {

        const a = e.target.closest('a');

        if (!a || !a.hasAttribute('href')) return;

        // Only normal left clicks
        if (
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
        ) {
            return;
        }

        // Allow links with another target to behave normally
        if (a.target && a.target !== '_self') return;

        const url = new URL(a.href, location.href);

        // External website: normal navigation
        if (url.origin !== location.origin) return;

        // Anchor on current page: normal behavior
        if (
            url.pathname === location.pathname &&
            url.hash
        ) {
            return;
        }

        // Only route HTML pages / directory paths
        if (!/(\.html?|\/)$/.test(url.pathname)) return;

        e.preventDefault();

        if (url.href !== location.href) {
            load(url.href, true);
        }
    });


    // -------------------------
    // BACK / FORWARD
    // -------------------------

    window.addEventListener('popstate', () => {
        load(location.href, false);
    });

})();