/* ==========================================
   INTERACTIVE LOGIC & ENGAGING EFFECTS
   Developed for Shreya ❤️
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeEnvelope = document.getElementById('welcome-envelope');
    const openBtn = document.getElementById('open-btn');
    const mainContent = document.getElementById('main-content');
    
    const musicPlayer = document.getElementById('music-player');
    const musicToggle = document.getElementById('music-toggle');
    const musicDisc = document.getElementById('music-disc');
    const songStatus = document.querySelector('.song-status');
    
    const loveEnvelope = document.getElementById('love-envelope-trigger');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const noHint = document.getElementById('no-hint');
    const proposalBlock = document.getElementById('proposal-block');
    
    const celebrationOverlay = document.getElementById('celebration-overlay');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- State Variables ---
    let musicPlaying = false;
    let notificationSent = { yes: false, no: false };
    let noClickCount = 0;
    let yesScale = 1;
    let noScale = 1;

    // --- VISUAL TOAST LOGGER FOR DEBBUGING ---
    function showToast(message, isError = false) {
        let toast = document.getElementById('debug-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'debug-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '20px';
            toast.style.padding = '12px 18px';
            toast.style.borderRadius = '8px';
            toast.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            toast.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
            toast.style.border = '1px solid rgba(251, 111, 146, 0.2)';
            toast.style.color = '#333';
            toast.style.fontFamily = 'Comfortaa, sans-serif';
            toast.style.fontSize = '12px';
            toast.style.zIndex = '99999';
            toast.style.transition = 'all 0.3s ease';
            toast.style.display = 'flex';
            toast.style.alignItems = 'center';
            toast.style.gap = '8px';
            document.body.appendChild(toast);
        }
        
        toast.style.borderColor = isError ? '#ff4d6d' : '#fb6f92';
        toast.innerHTML = (isError ? '❌ ' : '🔔 ') + message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        
        // Hide after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 5000);
    }

    // --- PUSH NOTIFICATION SYSTEM (ntfy.sh) ---
    // Sends instant push notifications to Ashish's phone
    const NTFY_TOPIC = 'shreya-proposal-love-ashish';

    function sendNotification(response) {
        const key = response.toLowerCase();
        // Only send each response type once per session to prevent spamming/rate-limits!
        if (notificationSent[key]) return;
        notificationSent[key] = true;

        const title = response === 'YES' ? '💍💖 SHE SAID YES!!!' : '😅 She clicked No...';
        const message = response === 'YES' 
            ? 'Shreya said YES to your proposal! 🎉🥳💕 Go celebrate!!!' 
            : 'Shreya clicked No (attempt #' + noClickCount + ') — but the button ran away! 😜';
        const priority = response === 'YES' ? '5' : '3';
        const tags = response === 'YES' ? 'heart_eyes,ring,tada' : 'sweat_smile';

        showToast('Sending notification to your phone...');

        // CHANNEL 1: Simple POST request (Message in body, params in URL - completely bypasses CORS preflight!)
        const postUrl = 'https://ntfy.sh/' + NTFY_TOPIC + '?' + new URLSearchParams({
            title: title,
            priority: priority,
            tags: tags
        }).toString();

        try {
            fetch(postUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: message
            }).catch(() => {});
        } catch(e) {}

        // CHANNEL 2: Image GET request (Extremely reliable backup for local static files)
        const getUrl = 'https://ntfy.sh/publish?' + new URLSearchParams({
            topic: NTFY_TOPIC,
            title: title,
            priority: priority,
            tags: tags,
            message: message
        }).toString();

        try {
            const img = new Image();
            img.src = getUrl;
        } catch(e) {}

        // CHANNEL 3: Navigator SendBeacon
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(getUrl);
            }
        } catch(e) {}

        // Immediate visual confirmation
        setTimeout(() => {
            showToast('Notification sent successfully! Check your phone.');
        }, 1000);
    }

    // --- 1. AUDIO PLAYER - Sitaare (From Ikkis) ---
    const bgMusic = new Audio('assets/sitaare.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.25; // Volume reduced by another 20% (to 0.25)
    bgMusic.currentTime = 14; // Start from 14 seconds

    // When the song loops, reset to 14 seconds
    bgMusic.addEventListener('timeupdate', () => {
        if (bgMusic.duration - bgMusic.currentTime < 0.3) {
            bgMusic.currentTime = 14;
        }
    });

    // Also handle the loop event to ensure it starts from 14s
    bgMusic.addEventListener('ended', () => {
        bgMusic.currentTime = 14;
        bgMusic.play();
    });

    function startMusic() {
        bgMusic.currentTime = bgMusic.currentTime < 14 ? 14 : bgMusic.currentTime;
        bgMusic.play().then(() => {
            musicPlaying = true;
            musicPlayer.classList.add('playing');
            songStatus.textContent = 'Sitaare ♪ Playing... ❤️';
            musicToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(err => {
            console.log('Audio play blocked by browser, user interaction needed:', err);
        });
    }

    function stopMusic() {
        bgMusic.pause();
        musicPlaying = false;
        musicPlayer.classList.remove('playing');
        songStatus.textContent = 'Paused ♪';
        musicToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (musicPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    });

    musicPlayer.addEventListener('click', () => {
        if (musicPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    });


    // --- 2. RISING HEARTS BACKGROUND ENGINE ---
    const heartsCanvas = document.getElementById('hearts-canvas');
    const hCtx = heartsCanvas.getContext('2d');
    let hearts = [];

    function resizeCanvas() {
        heartsCanvas.width = window.innerWidth;
        heartsCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Heart {
        constructor() {
            this.reset();
            this.y = Math.random() * heartsCanvas.height; // scatter initially
        }

        reset() {
            this.x = Math.random() * heartsCanvas.width;
            this.y = heartsCanvas.height + 20;
            this.size = Math.random() * 12 + 8;
            this.speed = Math.random() * 0.8 + 0.4;
            this.opacity = Math.random() * 0.4 + 0.15;
            this.swing = Math.random() * 4 + 2;
            this.swingSpeed = Math.random() * 0.02 + 0.005;
            this.angle = Math.random() * Math.PI;
            // Palette of beautiful romantic pinks/peaches
            const pinks = ['rgba(251, 111, 146, ', 'rgba(255, 179, 198, ', 'rgba(255, 204, 213, ', 'rgba(255, 77, 109, '];
            this.color = pinks[Math.floor(Math.random() * pinks.length)];
        }

        draw() {
            hCtx.save();
            hCtx.globalAlpha = this.opacity;
            hCtx.fillStyle = this.color + '1)';
            hCtx.beginPath();
            
            const x = this.x;
            const y = this.y;
            const size = this.size;
            
            // Heart shape drawing algorithm using Bezier curves
            hCtx.moveTo(x, y - size / 4);
            hCtx.bezierCurveTo(x, y - size, x - size, y - size, x - size, y - size / 4);
            hCtx.bezierCurveTo(x - size, y + size / 4, x, y + size, x, y + size * 1.15);
            hCtx.bezierCurveTo(x, y + size, x + size, y + size / 4, x + size, y - size / 4);
            hCtx.bezierCurveTo(x + size, y - size, x, y - size, x, y - size / 4);
            
            hCtx.fill();
            hCtx.restore();
        }

        update() {
            this.y -= this.speed;
            this.angle += this.swingSpeed;
            this.x += Math.sin(this.angle) * 0.3; // gentle swaying
            
            // Reset when heart flies off screen
            if (this.y < -30) {
                this.reset();
            }
        }
    }

    // Populate standard set of hearts
    const heartCount = Math.min(60, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < heartCount; i++) {
        hearts.push(new Heart());
    }

    function animateHearts() {
        hCtx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
        hearts.forEach(heart => {
            heart.update();
            heart.draw();
        });
        requestAnimationFrame(animateHearts);
    }
    animateHearts();


    // --- 3. SCROLL REVEAL (Polaroid timeline & elements) ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // reveal slightly before they hit view center
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // --- 4. FLIPPING REASONS CARDS (Mobile helper) ---
    // Toggle flipped class on click/tap for responsive touch support
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });


    // --- 5. ENVELOPE OPENING MECHANICS ---
    // Welcome Gate Envelope
    function handleOpenWelcomeGate() {
        welcomeEnvelope.classList.add('opened');
        
        // Wait for sliding preview to finish, then fade out screen
        setTimeout(() => {
            welcomeScreen.classList.add('fade-out');
            mainContent.classList.remove('hidden');
            
            // Proactively trigger scroll reveal updates
            window.dispatchEvent(new Event('scroll'));
            
            // Start sweet ambient chord music loop
            setTimeout(startMusic, 400);
        }, 1200);
    }

    openBtn.addEventListener('click', handleOpenWelcomeGate);
    welcomeEnvelope.addEventListener('click', handleOpenWelcomeGate);

    // Deep Love Letter Envelope
    loveEnvelope.addEventListener('click', () => {
        loveEnvelope.classList.toggle('open');
    });


    // --- 6. PLAYFUL "NO" BUTTON EVASION ENGINE ---

    const noPhrases = [
        "Are you sure? 🥺 Try again!",
        "Think of all the sweet warm cuddles! 💕",
        "Wait, there is actually no escape! 😉",
        "Yes is the only way forward, Shreya! ✨",
        "Look how tiny the 'No' button is! 😜",
        "Aha! I've disabled 'No' now! Just press YES! 😂"
    ];

    // Helper to calculate a random position inside the card avoiding escaping card boundaries
    function evadeNoButton() {
        const card = proposalBlock.querySelector('.proposal-card');
        const cardRect = card.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();
        
        // Bounding limits
        const padding = 20;
        const minX = padding;
        const maxX = cardRect.width - btnRect.width - padding;
        const minY = padding + 120; // avoid overlapping title/text
        const maxY = cardRect.height - btnRect.height - padding;
        
        // Generate random coords inside container
        const newX = Math.random() * (maxX - minX) + minX;
        const newY = Math.random() * (maxY - minY) + minY;
        
        // Convert to absolute style layout
        noBtn.style.position = 'absolute';
        noBtn.style.zIndex = '10';
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
    }

    // Desktop hover escape -> Hide it immediately!
    noBtn.addEventListener('mouseover', () => {
        noBtn.style.display = 'none';
        noHint.textContent = "Oops, only YES allowed! 💖💍";
    });

    // Touch / Click -> Hide it immediately!
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        noBtn.style.display = 'none';
        noHint.textContent = "Oops, only YES allowed! 💖💍";
    });


    // --- 7. GRAND CELEBRATION & CONFETTI ENGINE ---
    const confettiCanvas = document.getElementById('confetti-canvas');
    const cCtx = confettiCanvas.getContext('2d');
    let confettiList = [];
    let confettiActive = false;

    function resizeConfetti() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeConfetti);

    class Confetti {
        constructor() {
            this.x = Math.random() * confettiCanvas.width;
            this.y = Math.random() * -100 - 10;
            this.size = Math.random() * 10 + 6;
            this.shape = Math.random() > 0.45 ? 'square' : 'heart';
            this.speedY = Math.random() * 3 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
            
            // Cute vibrant party palette
            const colors = [
                '#fb6f92', '#ff4d6d', '#ffb3c6', '#ffc2d1', // pinks
                '#ffd166', '#ffb703', // golds
                '#a2d2ff', '#b5e2fa', // baby blues
                '#ff85a1'
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        draw() {
            cCtx.save();
            cCtx.translate(this.x, this.y);
            cCtx.rotate((this.rotation * Math.PI) / 180);
            cCtx.fillStyle = this.color;
            cCtx.beginPath();
            
            if (this.shape === 'square') {
                cCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            } else {
                // Heart shape confetti
                const size = this.size;
                cCtx.moveTo(0, -size / 4);
                cCtx.bezierCurveTo(0, -size, -size, -size, -size, -size / 4);
                cCtx.bezierCurveTo(-size, size / 4, 0, size, 0, size * 1.15);
                cCtx.bezierCurveTo(0, size, size, size / 4, size, -size / 4);
                cCtx.bezierCurveTo(size, -size, 0, -size, 0, -size / 4);
                cCtx.fill();
            }
            cCtx.restore();
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            
            // Keep falling
            if (this.y > confettiCanvas.height + 20) {
                this.y = -20;
                this.x = Math.random() * confettiCanvas.width;
            }
        }
    }

    function initConfetti() {
        resizeConfetti();
        confettiList = [];
        for (let i = 0; i < 180; i++) {
            confettiList.push(new Confetti());
        }
    }

    function animateConfetti() {
        if (!confettiActive) return;
        cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiList.forEach(c => {
            c.update();
            c.draw();
        });
        requestAnimationFrame(animateConfetti);
    }

    yesBtn.addEventListener('click', () => {
        // Trigger overlay & canvas
        celebrationOverlay.classList.remove('hidden');
        confettiActive = true;
        
        initConfetti();
        animateConfetti();
        
        // 🔔 Notify Ashish that SHE SAID YES!!!
        sendNotification('YES');
        
        // Ensure music keeps playing during celebration
        if (!musicPlaying) {
            startMusic();
        }
    });

    // Close Modal helper
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            celebrationOverlay.classList.add('hidden');
            confettiActive = false;
        });
    }

    // --- 8. PRE-COMPOSED WHATSAPP SENDER ---
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const defaultLoveMsg = "I said YES! 💍💖 You made me the happiest girl in the world! I love you so much!";
            const urlEncodedMsg = encodeURIComponent(defaultLoveMsg);
            window.open(`https://api.whatsapp.com/send?text=${urlEncodedMsg}`, '_blank');
        });
    }

});
