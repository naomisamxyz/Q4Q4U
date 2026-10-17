// q-video.js
// Desktop + mobile
// Q idle → click → splash + message → Q4 idle

(function () {


    // =========================================
    // CONTROLS
    // =========================================

    // Switch to mobile videos at this width
    const MOBILE_BREAKPOINT = 768;

    // Initial message fade-in
    const MESSAGE_FADE_IN = 10000;

    // Random opacity range
    const MESSAGE_MIN_OPACITY = 0.15;
    const MESSAGE_MAX_OPACITY = 0.75;

    // Random fade duration range
    const MESSAGE_MIN_FADE_TIME = 500;
    const MESSAGE_MAX_FADE_TIME = 1800;

    // Random pause between fades
    const MESSAGE_MIN_HOLD_TIME = 100;
    const MESSAGE_MAX_HOLD_TIME = 700;


    // =========================================
    // VIDEO FILES
    // =========================================

    const videos = {

        desktop: {

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
        },


        mobile: {

            idle: {
                mov: 'q/mobile/Q_idle_v.mov',
                webm: 'q/mobile/Q_idle_v.webm',
                loop: true
            },

            splash: {
                mov: 'q/mobile/Q_splash_v.mov',
                webm: 'q/mobile/Q_splash_v.webm',
                loop: false
            },

            idle2: {
                mov: 'q/mobile/Q4_idle_v.mov',
                webm: 'q/mobile/Q4_idle_v.webm',
                loop: true
            }
        }
    };


    // =========================================
    // INITIALIZE
    // =========================================

    window.initQVideo = function () {

        const video = document.getElementById('q-video');
        const message = document.getElementById('q-message');

        if (!video) return;


        // =========================================
        // DESKTOP OR MOBILE
        // =========================================

        const device =
            window.innerWidth <= MOBILE_BREAKPOINT
                ? 'mobile'
                : 'desktop';


        // =========================================
        // STATE
        // =========================================

        let state = 'idle';
        let transitioning = false;
        let messageTimer = null;


        // =========================================
        // VIDEO FORMAT
        // =========================================

        // Check whether this browser supports HEVC.
        // Safari will generally use MOV.
        // Other browsers can fall back to WebM.

        const canPlayHEVC = video.canPlayType(
            'video/mp4; codecs="hvc1"'
        );


        function getVideoSource(name) {

            const source = videos[device][name];

            return canPlayHEVC
                ? source.mov
                : source.webm;
        }


        // =========================================
        // PRELOAD VIDEOS
        // =========================================

        // Preload splash
        const splashPreload = document.createElement('video');

        splashPreload.preload = 'auto';
        splashPreload.src = getVideoSource('splash');
        splashPreload.load();


        // Preload second idle
        const idle2Preload = document.createElement('video');

        idle2Preload.preload = 'auto';
        idle2Preload.src = getVideoSource('idle2');
        idle2Preload.load();


        // =========================================
        // RANDOM NUMBER
        // =========================================

        function randomBetween(min, max) {

            return Math.random() * (max - min) + min;
        }


        // =========================================
        // LOAD VIDEO
        // =========================================

        function loadVideo(name) {

            const source = videos[device][name];
            const selectedSource = getVideoSource(name);

            // Debug: shows exactly which version is being used
            console.log('--------------------');
            console.log('DEVICE:', device);
            console.log('STATE:', name);
            console.log('SCREEN WIDTH:', window.innerWidth);
            console.log('MOV:', source.mov);
            console.log('WEBM:', source.webm);
            console.log('PLAYING:', selectedSource);
            console.log('--------------------');

            // Stop current video
            video.pause();

            // Set correct desktop/mobile source
            video.src = selectedSource;

            // Set looping for this state
            video.loop = source.loop;

            // Load the new video
            video.load();

            // Start from first frame
            video.currentTime = 0;

            // Play
            video.play().catch(error => {
                console.log('Video play prevented:', error);
            });
        }


        // =========================================
        // RANDOM MESSAGE FADE
        // =========================================

        function randomMessageFade() {

            // Stop automatically if router removed this page
            if (!message || !message.isConnected) return;


            // Pick random opacity
            const opacity = randomBetween(
                MESSAGE_MIN_OPACITY,
                MESSAGE_MAX_OPACITY
            );


            // Pick random fade speed
            const fadeTime = randomBetween(
                MESSAGE_MIN_FADE_TIME,
                MESSAGE_MAX_FADE_TIME
            );


            message.style.transition =
                `opacity ${fadeTime}ms ease-in-out`;

            message.style.opacity = opacity;


            // Pick random hold time
            const holdTime = randomBetween(
                MESSAGE_MIN_HOLD_TIME,
                MESSAGE_MAX_HOLD_TIME
            );


            // Repeat
            messageTimer = setTimeout(
                randomMessageFade,
                fadeTime + holdTime
            );
        }


        // =========================================
        // START MESSAGE
        // =========================================

        function showMessage() {

            if (!message) return;


            clearTimeout(messageTimer);


            // Start invisible
            message.style.transition = 'none';
            message.style.visibility = 'visible';
            message.style.opacity = '0';


            // Force browser to register opacity 0
            message.offsetHeight;


            // Initial fade in
            message.style.transition =
                `opacity ${MESSAGE_FADE_IN}ms ease-in-out`;

            message.style.opacity = '1';


            // Then begin infinite random fading
            messageTimer = setTimeout(
                randomMessageFade,
                MESSAGE_FADE_IN
            );
        }


        // =========================================
        // CLICK Q
        // =========================================

        video.addEventListener('click', function () {

            if (state !== 'idle') return;
            if (transitioning) return;


            transitioning = true;
            state = 'splash';


            // Start splash
            loadVideo('splash');


            // Start message at same moment
            showMessage();
        });


        // =========================================
        // SPLASH FINISHED
        // =========================================

        video.addEventListener('ended', function () {

            if (state !== 'splash') return;


            state = 'idle2';
            transitioning = false;


            // idle2 has already been preloaded,
            // so this transition should happen faster.
            loadVideo('idle2');
        });


        // =========================================
        // RESET
        // =========================================

        state = 'idle';
        transitioning = false;


        clearTimeout(messageTimer);


        if (message) {

            message.style.transition = 'none';
            message.style.opacity = '0';
            message.style.visibility = 'hidden';
        }


        // Always start at original Q
        loadVideo('idle');
    };


    // =========================================
    // INITIAL PAGE LOAD
    // =========================================

    window.initQVideo();


})();