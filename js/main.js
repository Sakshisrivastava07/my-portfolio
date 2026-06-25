document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for advanced scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it's a staggered item, apply a delay based on its index within its container
                if (entry.target.classList.contains('staggered')) {
                    const parent = entry.target.parentElement;
                    const siblings = Array.from(parent.querySelectorAll('.staggered'));
                    const index = siblings.indexOf(entry.target);
                    // 150ms delay per item
                    entry.target.style.transitionDelay = `${index * 0.15}s`;
                } else if (entry.target.classList.contains('staggered-word')) {
                    const parent = entry.target.parentElement;
                    const siblings = Array.from(parent.querySelectorAll('.staggered-word'));
                    const index = siblings.indexOf(entry.target);
                    // Fast stagger for words (50ms)
                    entry.target.style.transitionDelay = `${index * 0.05}s`;
                }

                if (entry.target.id === 'typewriter-container' && !entry.target.classList.contains('typed')) {
                    entry.target.classList.add('typed');
                    const text = entry.target.getAttribute('data-text');
                    entry.target.innerHTML = '';
                    let i = 0;
                    const speed = 50; // ms per char

                    function typeWriter() {
                        if (i < text.length) {
                            entry.target.innerHTML += text.charAt(i);
                            i++;
                            setTimeout(typeWriter, speed);
                        } else {
                            // Add blinking cursor at the end
                            entry.target.innerHTML += '<span class="typewriter-cursor"></span>';
                        }
                    }
                    typeWriter();
                }

                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, observerOptions);

    // Select all animatable elements
    const animatedElements = document.querySelectorAll('.animate-fade-up, .animate-slide-left, .animate-slide-right, .animate-scale, .word-reveal, #typewriter-container');
    animatedElements.forEach(el => observer.observe(el));

    // --- Hero Section Scripts ---

    // Custom Cursor tracking logic
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOrb = document.getElementById('cursor-orb');

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 
                          ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0);

    if (isTouchDevice) {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorOrb) cursorOrb.style.display = 'none';
        document.body.style.cursor = 'auto';
    } else if (cursorDot && cursorOrb) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let orbX = mouseX;
        let orbY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot follows instantly
            cursorDot.style.transform = `translate(calc(-50% + ${mouseX}px), calc(-50% + ${mouseY}px))`;
        });

        function animateOrb() {
            // Lerp orb (factor 0.1)
            orbX += (mouseX - orbX) * 0.1;
            orbY += (mouseY - orbY) * 0.1;

            cursorOrb.style.transform = `translate(calc(-50% + ${orbX}px), calc(-50% + ${orbY}px))`;

            requestAnimationFrame(animateOrb);
        }
        animateOrb();

        // Hover states
        const interactiveElements = document.querySelectorAll('a, button, h1, h2, h3, .nav-links a');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOrb.style.width = '70px';
                cursorOrb.style.height = '70px';
            });
            el.addEventListener('mouseleave', () => {
                cursorOrb.style.width = '36px';
                cursorOrb.style.height = '36px';
            });
        });
    }

    // Glitch Text Logic
    const roles = ['ASPIRING SOFTWARE ENGINEER', 'AI/ML ENTHUSIAST', 'FULL STACK DEVELOPER', 'PROBLEM SOLVER'];
    const glitchText = document.getElementById('glitch-text');
    let currentRoleIndex = 0;
    const symbols = '#@%!?*&^$';

    if (glitchText) {
        setInterval(() => {
            const nextRoleIndex = (currentRoleIndex + 1) % roles.length;
            const targetWord = roles[nextRoleIndex];
            const currentWord = roles[currentRoleIndex];

            let iterations = 0;
            const maxIterations = 10; // ~400ms at 40ms interval

            const glitchInterval = setInterval(() => {
                let scrambledWord = '';
                // Scramble animation length based on target word length to avoid layout jumps
                for (let i = 0; i < targetWord.length; i++) {
                    if (Math.random() < (iterations / maxIterations)) {
                        scrambledWord += targetWord[i];
                    } else {
                        scrambledWord += symbols[Math.floor(Math.random() * symbols.length)];
                    }
                }
                glitchText.innerText = scrambledWord;

                iterations++;
                if (iterations >= maxIterations) {
                    clearInterval(glitchInterval);
                    glitchText.innerText = targetWord;
                    currentRoleIndex = nextRoleIndex;
                }
            }, 40);

        }, 3000);
    }

    // --- Active Navbar Highlighting (Scrollspy) ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-center a');
    let isScrollingFromClick = false;

    function updateActiveNavbarLink() {
        if (isScrollingFromClick) return;

        let current = '';
        const scrollPosition = window.scrollY + 200; // offset for navbar height and triggers

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const targetId = link.getAttribute('href').substring(1);
            if (targetId === current) {
                link.classList.add('active');
            }
        });
    }

    // Direct click handler for instant feedback
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            isScrollingFromClick = true;
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Resume scrollspy after smooth scroll animation completes (~800ms)
            setTimeout(() => {
                isScrollingFromClick = false;
            }, 800);
        });
    });

    window.addEventListener('scroll', updateActiveNavbarLink);
    updateActiveNavbarLink(); // Initialize on page load

    // --- Mobile Menu Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navCenter = document.querySelector('.nav-center');

    if (navToggle && navCenter) {
        navToggle.addEventListener('click', () => {
            const isActive = navToggle.classList.toggle('active');
            navCenter.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Close menu when clicking on nav links
        const navLinksMobile = navCenter.querySelectorAll('a');
        navLinksMobile.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navCenter.classList.remove('active');
                document.body.classList.remove('menu-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
});
