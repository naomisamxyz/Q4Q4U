// q-video.js
// Q idle → click → splash + message → Q4 idle
// Message continuously fades between random opacity levels.

(function () {


    // =========================================
    // CONTROLS
    // =========================================

    // Initial fade-in
    const MESSAGE_FADE_IN = 10000;

    // Random opacity range
    const MESSAGE_MIN_OPACITY = 0.15;
    const MESSAGE_MAX_OPACITY = 1;

    // Random fade duration range in milliseconds
    const MESSAGE_MIN_FADE_TIME = 500;
    const MESSAGE_MAX_FADE_TIME = 1800;

    // Random pause between fades in milliseconds
    const MESSAGE_MIN_HOLD_TIME = 100;
    const MESSAGE_MAX_HOLD_TIME = 700;


    // =========================================
    // VIDEO FILES
    // =========================================

    const videos = {

        idle: {
            mov: 'q/desktop/Q_idle_h.mov',
            webm: 'q/desktop/Q_idle_h.webm',
            loop: true
        },

        splash: {
            mov: 'q/desktop/Q_splash_h.mov',
            webm: 'q/desktop/Q_splash_h.webm',
            loop: false
        },

        idle2: {
            mov: 'q/desktop/Q4_idle_h.mov',
            webm: 'q/desktop/Q4_idle_h.webm',
            loop: true
        }
    };


    // =========================================
    // INITIALIZE
    // =========================================

    window.initQVideo = function () {

        const video = document.getElementById('q-video');
        const message = document.getElementById('q-message');

        if (!video) return;


        // -------------------------
        // STATE
        // -------------------------

        let state = 'idle';
        let transitioning = false;

        let messageTimer = null;


        // -------------------------
        // RANDOM NUMBER
        // -------------------------

        function randomBetween(min, max) {
            return Math.random() * (max - min) + min;
        }


        // -------------------------
        // LOAD VIDEO
        // -------------------------

        function loadVideo(name) {

            const source = videos[name];

            video.pause();
            video.innerHTML = '';

            // MOV
            const mov = document.createElement('source');
            mov.src = source.mov;
            mov.type = 'video/mp4; codecs="hvc1"';

            // WebM fallback
            const webm = document.createElement('source');
            webm.src = source.webm;
            webm.type = 'video/webm';

            video.appendChild(mov);
            video.appendChild(webm);

            video.loop = source.loop;

            video.load();
            video.currentTime = 0;

            video.play().catch(error => {
                console.log('Video play prevented:', error);
            });
        }


        // -------------------------
        // RANDOM MESSAGE FADE
        // -------------------------

        function randomMessageFade() {

            if (!message || !message.isConnected) return;

            // Pick a new random opacity
            const opacity = randomBetween(
                MESSAGE_MIN_OPACITY,
                MESSAGE_MAX_OPACITY
            );

            // Pick a random fade duration
            const fadeTime = randomBetween(
                MESSAGE_MIN_FADE_TIME,
                MESSAGE_MAX_FADE_TIME
            );

            message.style.transition =
                `opacity ${fadeTime}ms ease-in-out`;

            message.style.opacity = opacity;


            // Pick a random pause before next fade
            const holdTime = randomBetween(
                MESSAGE_MIN_HOLD_TIME,
                MESSAGE_MAX_HOLD_TIME
            );

            messageTimer = setTimeout(
                randomMessageFade,
                fadeTime + holdTime
            );
        }


        // -------------------------
        // START MESSAGE
        // -------------------------

        function showMessage() {

            if (!message) return;

            clearTimeout(messageTimer);

            message.style.transition = 'none';
            message.style.visibility = 'visible';
            message.style.opacity = '0';

            // Force browser to register starting opacity
            message.offsetHeight;

            // Initial fade all the way in
            message.style.transition =
                `opacity ${MESSAGE_FADE_IN}ms ease-in-out`;

            message.style.opacity = '1';

            // Then start infinite random fading
            messageTimer = setTimeout(
                randomMessageFade,
                MESSAGE_FADE_IN
            );
        }


        // -------------------------
        // CLICK Q
        // -------------------------

        video.addEventListener('click', function () {

            if (state !== 'idle') return;
            if (transitioning) return;

            transitioning = true;
            state = 'splash';

            // Start both together
            loadVideo('splash');
            showMessage();
        });


        // -------------------------
        // SPLASH FINISHED
        // -------------------------

        video.addEventListener('ended', function () {

            if (state !== 'splash') return;

            state = 'idle2';
            transitioning = false;

            loadVideo('idle2');
        });


        // -------------------------
        // RESET
        // -------------------------

        state = 'idle';
        transitioning = false;

        clearTimeout(messageTimer);

        if (message) {
            message.style.transition = 'none';
            message.style.opacity = '0';
            message.style.visibility = 'hidden';
        }

        loadVideo('idle');
    };


    // Initial page load
    window.initQVideo();

})();