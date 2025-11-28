// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load categories
    loadCategories();
    
    // Mobile menu toggle
    const hamburger = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    
    // Debug: Log all elements
    console.log('Mobile Menu Debug:', {
        hamburger: hamburger ? 'Found' : 'NOT FOUND',
        mobileMenu: mobileMenu ? 'Found' : 'NOT FOUND',
        mobileMenuOverlay: mobileMenuOverlay ? 'Found' : 'NOT FOUND',
        mobileMenuClose: mobileMenuClose ? 'Found' : 'NOT FOUND'
    });
    
    function openMobileMenu() {
        console.log('openMobileMenu called');
        if (mobileMenu && mobileMenuOverlay) {
            console.log('Adding active classes');
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('Menu should be open now. mobileMenu classes:', mobileMenu.className);
        } else {
            console.error('Cannot open menu - elements missing:', {
                mobileMenu: !!mobileMenu,
                mobileMenuOverlay: !!mobileMenuOverlay
            });
        }
    }
    
    function closeMobileMenu() {
        console.log('closeMobileMenu called');
        if (mobileMenu && mobileMenuOverlay) {
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    if (hamburger) {
        console.log('Hamburger menu found and initializing...');
        hamburger.addEventListener('click', function(e) {
            console.log('Hamburger clicked!', e);
            e.preventDefault();
            e.stopPropagation();
            hamburger.classList.toggle('active');
            console.log('Hamburger active class toggled. Calling openMobileMenu...');
            openMobileMenu();
        });
        console.log('Hamburger click listener attached');
    } else {
        console.error('Hamburger menu element not found!');
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            closeMobileMenu();
            if (hamburger) hamburger.classList.remove('active');
        });
    }
    
    // Close mobile menu when clicking overlay
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function() {
            closeMobileMenu();
            if (hamburger) hamburger.classList.remove('active');
        });
    }
    
    // Close mobile menu when clicking outside (but not on hamburger)
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenuOverlay && hamburger && 
            !mobileMenu.contains(e.target) && 
            !hamburger.contains(e.target) &&
            !mobileMenuOverlay.contains(e.target) &&
            mobileMenu.classList.contains('active')) {
            closeMobileMenu();
            hamburger.classList.remove('active');
        }
    });
    
    // Test function to manually trigger menu (for debugging)
    window.testMobileMenu = function() {
        console.log('Testing mobile menu manually');
        if (hamburger) {
            openMobileMenu();
        }
    };

    // Smooth scrolling for navigation links
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
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Modal functionality
    const modal = document.getElementById('demo');
    const modalTriggers = document.querySelectorAll('a[href="#demo"]');
    const closeBtn = modal ? modal.querySelector('.close') : null;

    // Open modal
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });


    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .testimonial-card, .faq-item, .benefit-content, .benefit-image');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Counter animation for stats
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('h3');
                counters.forEach(counter => {
                    const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
                    const suffix = counter.textContent.replace(/[\d]/g, '');
                    let current = 0;
                    const increment = target / 100;
                    
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            counter.textContent = Math.ceil(current) + suffix;
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target + suffix;
                        }
                    };
                    
                    updateCounter();
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-container');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('.btn-primary, .btn-secondary, .feature-card, .testimonial-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add typing effect for hero title
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid white';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                heroTitle.style.borderRight = 'none';
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add floating animation to payment interface
    const paymentInterface = document.querySelector('.payment-interface');
    if (paymentInterface) {
        paymentInterface.style.animation = 'float 3s ease-in-out infinite';
    }

    // Add CSS animation for floating effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .btn-primary {
            animation: pulse 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #3498db, #e74c3c);
        z-index: 9999;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
});

// Load categories from API
function loadCategories() {
    const baseURL = window.location.origin;
    const apiUrl = `${baseURL}/api/public/categories`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Categories loaded:', data);
            if (data.status && data.data && data.data.length > 0) {
                renderCategories(data.data);
            } else {
                console.warn('No categories found');
                // Show message if no categories
                const mobileMenu = document.getElementById('mobileCategories');
                if (mobileMenu) {
                    mobileMenu.innerHTML = '<p style="padding: 12px; color: #666; text-align: center;">No categories available</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            // Show error message
            const mobileMenu = document.getElementById('mobileCategories');
            if (mobileMenu) {
                mobileMenu.innerHTML = '<p style="padding: 12px; color: #999; text-align: center;">Unable to load categories</p>';
            }
        });
}

// Generate slug from category name
function generateCategorySlug(name) {
    if (!name) return "";
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Render categories in header
function renderCategories(categories) {
    const desktopMenu = document.getElementById('categoriesMenu');
    const mobileMenu = document.getElementById('mobileCategories');
    
    if (!desktopMenu || !mobileMenu) return;
    
    // Desktop menu
    desktopMenu.innerHTML = categories.map(category => {
        const slug = generateCategorySlug(category.name);
        const shortId = category._id.toString().substring(0, 6);
        const categoryUrl = `/category/${slug}-${shortId}`;
        return `<a href="${categoryUrl}" class="category-link">${category.name}</a>`;
    }).join('');
    
    // Mobile menu
    mobileMenu.innerHTML = categories.map(category => {
        const slug = generateCategorySlug(category.name);
        const shortId = category._id.toString().substring(0, 6);
        const categoryUrl = `/category/${slug}-${shortId}`;
        return `<a href="${categoryUrl}" class="category-link">${category.name}</a>`;
    }).join('');
} 

// App download links configuration
const APP_DOWNLOAD_LINKS = {
    customer: {
        android: 'https://play.google.com/store/apps/details?id=com.skedisy.customer',
        ios: 'https://apps.apple.com/fr/app/skedisy/id6752954525'
    },
    expert: {
        android: 'https://play.google.com/store/apps/details?id=com.skedisy.expert',
        ios: 'https://apps.apple.com/fr/app/skedisy-xp/id6752965522'
    }
};

// Global variable to store current app type
let currentAppType = 'customer';

// Phone Selection Modal Functions
function openPhoneSelection(appType) {
    currentAppType = appType;
    const modal = document.getElementById('phone-selection-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    
    // Update modal content based on app type
    if (appType === 'customer') {
        modalTitle.textContent = 'Download Customer App';
        modalDescription.textContent = 'Choose your device to download the Skedisy Customer App';
    } else if (appType === 'expert') {
        modalTitle.textContent = 'Download Expert App';
        modalDescription.textContent = 'Choose your device to download the Skedisy Expert App';
    }
    
    // Update download links
    updateDownloadLinks(appType);
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateDownloadLinks(appType) {
    const androidLink = document.getElementById('android-link');
    const iosLink = document.getElementById('ios-link');
    
    if (androidLink && iosLink) {
        androidLink.onclick = function() {
            window.open(APP_DOWNLOAD_LINKS[appType].android, '_blank');
        };
        
        iosLink.onclick = function() {
            window.open(APP_DOWNLOAD_LINKS[appType].ios, '_blank');
        };
    }
}

// Phone Selection Modal Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const phoneModal = document.getElementById('phone-selection-modal');
    const phoneModalClose = phoneModal.querySelector('.close');
    
    // Close phone selection modal
    phoneModalClose.addEventListener('click', function() {
        phoneModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === phoneModal) {
            phoneModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Handle phone option clicks
    const phoneOptions = document.querySelectorAll('.phone-option');
    phoneOptions.forEach(option => {
        option.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const downloadLink = APP_DOWNLOAD_LINKS[currentAppType][platform];
            window.open(downloadLink, '_blank');
            phoneModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
});

// QR code generation (using qrcodejs CDN)
window.addEventListener('DOMContentLoaded', function() {
    // Load QRCode.js dynamically if not present
    if (typeof QRCode === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = generateQRCodes;
        document.body.appendChild(script);
    } else {
        generateQRCodes();
    }

    function generateQRCodes() {
        var customerQR = document.getElementById('qr-customer-top');
        var expertQR = document.getElementById('qr-expert-top');
        
        // Generate QR codes that trigger phone selection modal
        if (customerQR) {
            new QRCode(customerQR, {
                text: 'https://skedisy.com/#download-customer',
                width: 128,
                height: 128,
                colorDark : '#111',
                colorLight : '#fff',
                correctLevel : QRCode.CorrectLevel.H
            });
        }
        if (expertQR) {
            new QRCode(expertQR, {
                text: 'https://skedisy.com/#download-expert',
                width: 128,
                height: 128,
                colorDark : '#111',
                colorLight : '#fff',
                correctLevel : QRCode.CorrectLevel.H
            });
        }
    }

    // FAQ collapsible logic with plus icon
    var faqItems = document.querySelectorAll('.faq-item.collapsible');
    faqItems.forEach(function(item) {
        var header = item.querySelector('h3');
        // Add plus icon if not present
        if (!header.querySelector('.faq-plus')) {
            var plus = document.createElement('span');
            plus.className = 'faq-plus';
            plus.textContent = '+';
            header.appendChild(plus);
        }
        header.addEventListener('click', function(e) {
            // Collapse others
            faqItems.forEach(function(other) {
                if (other !== item) other.classList.remove('active');
            });
            // Toggle this one
            item.classList.toggle('active');
        });
    });
}); 