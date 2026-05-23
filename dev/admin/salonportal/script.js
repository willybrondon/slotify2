// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system (if language.js is loaded)
    if (typeof setLanguage === 'function') {
        const savedLang = localStorage.getItem('skedisy-language') || 'fr';
        setLanguage(savedLang);
    }
    
    // Load categories (client homepage only — not on /professionnel)
    const isProPage = document.body.dataset.page === 'pro';
    if (isProPage) {
        initProNavigation();
    } else {
        loadCategories();
    }
    
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
            
            // Store current scroll position
            const scrollY = window.scrollY;
            document.body.style.top = `-${scrollY}px`;
            
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.top = '0';
            document.body.style.left = '0';
            
            // Force visibility of menu content
            const menuContent = document.querySelector('.mobile-menu-content');
            const loginBtn = document.querySelector('.btn-login-mobile-menu');
            const categories = document.getElementById('mobileCategories');
            
            if (menuContent) {
                menuContent.style.display = 'flex';
                menuContent.style.visibility = 'visible';
                menuContent.style.opacity = '1';
            }
            if (loginBtn) {
                loginBtn.style.display = 'block';
                loginBtn.style.visibility = 'visible';
                loginBtn.style.opacity = '1';
            }
            if (categories) {
                categories.style.display = 'flex';
                categories.style.visibility = 'visible';
                categories.style.opacity = '1';
            }
            
            console.log('Menu should be open now. mobileMenu classes:', mobileMenu.className);
            console.log('Menu content visibility:', {
                menuContent: menuContent ? 'Found' : 'NOT FOUND',
                loginBtn: loginBtn ? 'Found' : 'NOT FOUND',
                categories: categories ? 'Found' : 'NOT FOUND'
            });
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
            document.body.classList.remove('menu-open');
            
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            document.body.style.left = '';
            
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
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

    // Typing effect removed - was causing duplicate hero title when translation is in French

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

// Pro page nav (no category browse)
function initProNavigation() {
    const desktopMenu = document.getElementById('proNavMenu');
    const currentLang = localStorage.getItem('skedisy-language') || 'fr';
    const switchToLang = currentLang === 'fr' ? 'en' : 'fr';
    const switchToShort = switchToLang.toUpperCase();
    const docsHref = 'https://skedisy.com/docs/index.html';
    const navBits =
        '<a href="' + docsHref + '" class="nav-link documentation-link" data-translate="nav.documentation">Docs</a>' +
        '<a href="/professionnel/" class="nav-link nav-link-pro-active" data-translate="nav.pro">Pro</a>' +
        '<button class="lang-switcher desktop-only" data-lang="' + switchToLang + '" title="Switch to ' + switchToShort + '">' +
        '<i class="fas fa-globe"></i> <span>' + switchToShort + '</span></button>';
    if (desktopMenu) {
        desktopMenu.innerHTML = navBits;
    }
    if (typeof updateLanguageSwitcher === 'function') {
        updateLanguageSwitcher();
    }
    if (typeof translatePage === 'function') {
        translatePage();
    }
}

// Load categories from API
function loadCategories() {
    const baseURL = window.location.origin;
    // Get current language from localStorage, default to French
    const currentLang = localStorage.getItem('skedisy-language') || 'fr';
    const apiUrl = `${baseURL}/api/public/categories?language=${currentLang}`;
    
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
    
    // Desktop menu - add Docs link and Language Switcher at the end
    const categoriesHtml = categories.map(category => {
        const slug = generateCategorySlug(category.name);
        const shortId = category._id.toString().substring(0, 6);
        const categoryUrl = `/category/${slug}-${shortId}`;
        return `<a href="${categoryUrl}" class="category-link">${category.name}</a>`;
    }).join('');
    
    // Get current language for the switcher button
    const currentLang = localStorage.getItem('skedisy-language') || 'fr';
    const switchToLang = currentLang === 'fr' ? 'en' : 'fr';
    const switchToShort = switchToLang.toUpperCase(); // EN or FR
    
    desktopMenu.innerHTML = categoriesHtml + 
        '<a href="https://skedisy.com/docs/index.html" class="nav-link documentation-link" data-translate="nav.documentation">Docs</a>' +
        `<button class="lang-switcher desktop-only" data-lang="${switchToLang}" title="Switch to ${switchToShort}">
            <i class="fas fa-globe"></i> <span>${switchToShort}</span>
        </button>`;
    
    // Mobile menu
    mobileMenu.innerHTML = categories.map(category => {
        const slug = generateCategorySlug(category.name);
        const shortId = category._id.toString().substring(0, 6);
        const categoryUrl = `/category/${slug}-${shortId}`;
        return `<a href="${categoryUrl}" class="category-link">${category.name}</a>`;
    }).join('');
    
    // Update language switcher display after categories are loaded
    // The event delegation in initLanguage should handle clicks, but we need to update the display
    if (typeof updateLanguageSwitcher === 'function') {
        updateLanguageSwitcher();
    }
    
    // Re-translate the page to update the new elements
    if (typeof translatePage === 'function') {
        translatePage();
    }
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

// Match desktop vs mobile behavior with salon web page (salon.controller.js openApp)
function isSkedisyMobileBrowser() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    return isIOS || isAndroid;
}

function getSkedisyMarketingBaseUrl() {
    const o = typeof window !== 'undefined' && window.location && window.location.origin;
    if (o && /^https?:/i.test(o)) {
        return o.replace(/\/+$/, '');
    }
    return 'https://skedisy.com';
}

function scrollToAppDownloadHash() {
    const h = window.location.hash;
    if (h !== '#download-customer' && h !== '#download-expert') return;
    const id = h.slice(1);
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

window.addEventListener('hashchange', scrollToAppDownloadHash);
document.addEventListener('DOMContentLoaded', scrollToAppDownloadHash);

/**
 * Desktop: send users to the marketing site get-app section (QR + labels), same idea as salon page redirect.
 */
function goDesktopAppLanding(hash) {
    const targetHash = hash || '#download-customer';
    const base = getSkedisyMarketingBaseUrl();
    let path = (window.location.pathname || '').replace(/\/+$/, '');
    if (!path) path = '/';
    const onHome = path === '/' || /index\.html$/i.test(path);
    const sameOrigin = window.location.origin.replace(/\/+$/, '') === base;
    if (onHome && sameOrigin) {
        if (window.location.hash !== targetHash) {
            window.location.hash = targetHash;
        }
        requestAnimationFrame(function() {
            scrollToAppDownloadHash();
        });
        return;
    }
    window.location.href = base.replace(/\/+$/, '') + targetHash;
}

// Phone Selection Modal Functions
function openPhoneSelection(appType) {
    currentAppType = appType;
    const hash = appType === 'expert' ? '#download-expert' : '#download-customer';

    if (!isSkedisyMobileBrowser()) {
        goDesktopAppLanding(hash);
        return;
    }

    const modal = document.getElementById('phone-selection-modal');
    if (!modal) {
        const links = APP_DOWNLOAD_LINKS[appType];
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        window.open(isIOS ? links.ios : links.android, '_blank');
        return;
    }

    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    if (appType === 'customer') {
        modalTitle.textContent = 'Download Customer App';
        modalDescription.textContent = 'Choose your device to download the Skedisy Customer App';
    } else if (appType === 'expert') {
        modalTitle.textContent = 'Download Expert App';
        modalDescription.textContent = 'Choose your device to download the Skedisy Expert App';
    }

    updateDownloadLinks(appType);

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
    if (!phoneModal) return;

    const phoneModalClose = phoneModal.querySelector('.close');
    if (phoneModalClose) {
        phoneModalClose.addEventListener('click', function() {
            phoneModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target === phoneModal) {
            phoneModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

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

// QR codes are generated by qr-code-init.js (rounded corners like customer app)

// FAQ collapsible logic with plus icon
window.addEventListener('DOMContentLoaded', function() {
    var faqItems = document.querySelectorAll('.faq-item.collapsible');
    faqItems.forEach(function(item) {
        var header = item.querySelector('h3');
        // Add plus icon if not present
        if (header && !header.querySelector('.faq-plus')) {
            var plus = document.createElement('span');
            plus.className = 'faq-plus';
            plus.textContent = '+';
            header.appendChild(plus);
        }
        if (header) {
            header.addEventListener('click', function(e) {
                // Collapse others
                faqItems.forEach(function(other) {
                    if (other !== item) other.classList.remove('active');
                });
                // Toggle this one
                item.classList.toggle('active');
            });
        }
    });
}); 