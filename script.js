// Particle Background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Typing Animation with Updated Text
const typedTextSpan = document.querySelector(".typed-text");
const cursorSpan = document.querySelector(".cursor");

const textArray = ["AI Engineer", "Machine Learning Engineer", "Deep Learning Specialist", "Data Scientist"];
const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 2000;
let textArrayIndex = 0;
let charIndex = 0;

function type() {
    if (charIndex < textArray[textArrayIndex].length) {
        typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);
    } else {
        setTimeout(erase, newTextDelay);
    }
}

function erase() {
    if (charIndex > 0) {
        typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingDelay);
    } else {
        textArrayIndex++;
        if (textArrayIndex >= textArray.length) textArrayIndex = 0;
        setTimeout(type, typingDelay + 1100);
    }
}

// Mobile Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger?.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        // Close mobile menu if open
        navMenu.classList.remove("active");
    });
});

// Skill Bar Animation
const skillBars = document.querySelectorAll('.skill-progress');
const animateSkillBars = () => {
    skillBars.forEach(bar => {
        const skill = bar.getAttribute('data-skill');
        bar.style.width = skill + '%';
    });
};

// Updated Counter Animation for Correct Metrics
function animateCounter(element, target) {
    let current = 0;
    const duration = 2000; // 2 seconds
    const stepTime = 50; // Update every 50ms
    const steps = duration / stepTime;
    const increment = target / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate skill bars
            if (entry.target.classList.contains('skills')) {
                animateSkillBars();
            }
            
            // Animate counters when stats section is visible
            if (entry.target.classList.contains('stats')) {
                const counters = entry.target.querySelectorAll('.stat-number');
                counters.forEach(counter => {
                    if (!counter.classList.contains('animated')) {
                        const target = parseInt(counter.getAttribute('data-target'));
                        animateCounter(counter, target);
                        counter.classList.add('animated'); // Prevent re-animation
                    }
                });
            }
            
            // Add animation class
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Also observe the stats div specifically
document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
});

// Neural Network Canvas Animation
const canvas = document.getElementById('neural-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const nodes = [];
    const connections = [];
    const nodeCount = 20;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 3 + 2
        });
    }
    
    function drawNeuralNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff88';
            ctx.fill();
        });
        
        // Draw connections
        nodes.forEach((node, i) => {
            nodes.slice(i + 1).forEach(otherNode => {
                const distance = Math.sqrt(
                    Math.pow(node.x - otherNode.x, 2) + 
                    Math.pow(node.y - otherNode.y, 2)
                );
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.strokeStyle = `rgba(0, 255, 136, ${1 - distance / 100})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(drawNeuralNetwork);
    }
    
    drawNeuralNetwork();
}

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // You can add your email service integration here
        // For now, just show a success message
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create particles
    createParticles();
    
    // Start typing animation after a delay
    setTimeout(type, newTextDelay + 250);
    
    // Initialize skill bars (set width to 0 initially)
    skillBars.forEach(bar => {
        bar.style.width = '0%';
    });
    
    // Set initial counter values to 0
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = counter.getAttribute('data-target');
        if (target) {
            counter.textContent = '0';
        }
    });
});

// Add glowing cursor effect (optional - can be removed if it affects performance)
let mouseTimer;
document.addEventListener('mousemove', (e) => {
    clearTimeout(mouseTimer);
    
    const existingCursor = document.querySelector('.mouse-glow');
    if (existingCursor) {
        existingCursor.style.left = e.clientX + 'px';
        existingCursor.style.top = e.clientY + 'px';
    } else {
        const cursor = document.createElement('div');
        cursor.className = 'mouse-glow';
        cursor.style.position = 'fixed';
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.background = 'radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(cursor);
    }
    
    mouseTimer = setTimeout(() => {
        const cursor = document.querySelector('.mouse-glow');
        if (cursor) {
            cursor.style.opacity = '0';
            setTimeout(() => cursor.remove(), 300);
        }
    }, 100);
});

// Handle window resize for canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
});

// Add active nav link highlighting based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
});

// Lazy loading for images (if you add more images in the future)
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        }
    });
});

// Observe all images with data-src attribute
document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Console Easter Egg
console.log('%c Welcome to Krishna Singh\'s Portfolio! ', 'background: linear-gradient(45deg, #00ff88, #0099ff); color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c 🚀 AI/ML Engineer | Data Scientist | Deep Learning Specialist ', 'color: #00ff88; font-size: 14px;');
console.log('%c 📧 Get in touch: krishnasingh8404@gmail.com ', 'color: #0099ff; font-size: 12px;');