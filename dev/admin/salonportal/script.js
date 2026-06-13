// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    mountStoreBadges();

    if (typeof setLanguage === 'function') {
        const savedLang = localStorage.getItem('skedisy-language') || 'fr';
        setLanguage(savedLang);
    }

    const isProPage = document.body.dataset.page === 'pro';
    if (isProPage) {
        initProNavigation();
    } else {
        loadCategories();
    }

    const pathNorm = window.location.pathname.replace(/\/$/, '') || '/';
    if (pathNorm === '/blog') {
        document.querySelectorAll('a[href="/blog/"]').forEach(function (el) {
            el.classList.add('nav-btn--active');
        });
    }

    const hamburger = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const categoriesDrawer = document.getElementById('mobileCategoriesDrawer');
    const categoriesToggle = document.getElementById('mobileCategoriesToggle');
    const categoriesClose = document.getElementById('mobileCategoriesClose');

    function closeCategoriesDrawer() {
        if (!categoriesDrawer || !categoriesToggle) return;
        categoriesDrawer.hidden = true;
        categoriesToggle.setAttribute('aria-expanded', 'false');
    }

    function openCategoriesDrawer() {
        if (!categoriesDrawer || !categoriesToggle) return;
        categoriesDrawer.hidden = false;
        categoriesToggle.setAttribute('aria-expanded', 'true');
        fitMobileMenuHeight();
    }

    function fitMobileMenuHeight() {
        if (!mobileMenu || !mobileMenu.classList.contains('active')) return;
        requestAnimationFrame(function () {
            mobileMenu.style.height = 'auto';
        });
    }

    function openMobileMenu() {
        if (!mobileMenu || !mobileMenuOverlay) return;
        const scrollY = window.scrollY;
        document.body.dataset.scrollLock = String(scrollY);
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
        fitMobileMenuHeight();
    }

    function closeMobileMenu() {
        if (!mobileMenu || !mobileMenuOverlay) return;
        closeCategoriesDrawer();
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        const scrollY = parseInt(document.body.dataset.scrollLock || '0', 10);
        delete document.body.dataset.scrollLock;
        window.scrollTo(0, scrollY);
    }

    if (categoriesToggle && categoriesDrawer) {
        categoriesToggle.addEventListener('click', function () {
            if (categoriesDrawer.hidden) openCategoriesDrawer();
            else closeCategoriesDrawer();
        });
    }
    if (categoriesClose) {
        categoriesClose.addEventListener('click', closeCategoriesDrawer);
    }

    document.querySelectorAll('[data-mobile-download]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const appType = btn.getAttribute('data-mobile-download') || 'customer';
            if (typeof openPhoneSelection === 'function') {
                openPhoneSelection(appType);
            }
            closeMobileMenu();
            if (hamburger) hamburger.classList.remove('active');
        });
    });

    if (hamburger) {
        hamburger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (mobileMenu.classList.contains('active')) {
                closeMobileMenu();
                hamburger.classList.remove('active');
            } else {
                hamburger.classList.add('active');
                openMobileMenu();
            }
        });
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function () {
            closeMobileMenu();
            if (hamburger) hamburger.classList.remove('active');
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function () {
            closeMobileMenu();
            if (hamburger) hamburger.classList.remove('active');
        });
    }

    document.addEventListener('click', function (e) {
        if (mobileMenu && mobileMenuOverlay && hamburger &&
            !mobileMenu.contains(e.target) &&
            !hamburger.contains(e.target) &&
            !mobileMenuOverlay.contains(e.target) &&
            mobileMenu.classList.contains('active')) {
            closeMobileMenu();
            hamburger.classList.remove('active');
        }
    });

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
        background: linear-gradient(90deg, var(--sk-primary), var(--sk-primary-hover));
        z-index: 9999;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
});

// Pro page nav (no category browse, no AI Concierge — client-only feature)
function initProNavigation() {
    const desktopMenu = document.getElementById('proNavMenu');
    const currentLang = localStorage.getItem('skedisy-language') || 'fr';
    const switchToLang = currentLang === 'fr' ? 'en' : 'fr';
    const displayLang = currentLang === 'fr' ? 'FR' : 'EN';
    const blogHref = '/blog/';
    const navBits =
        '<span class="nav-menu-actions">' +
        '<a href="' + blogHref + '" class="nav-btn" data-translate="nav.blog">Blog</a>' +
        '<a href="/professionnel/" class="nav-btn nav-btn--active" data-translate="nav.pro">Pro</a>' +
        '<button type="button" class="nav-btn lang-switcher desktop-only" data-lang="' + switchToLang + '">' +
        '<i class="fas fa-globe"></i> <span>' + displayLang + '</span></button>' +
        '</span>';
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
                const mobileMenu = document.getElementById('mobileCategories');
                const homeGrid = document.getElementById('homeCategoriesGrid');
                if (mobileMenu) {
                    mobileMenu.innerHTML = '<p style="padding: 12px; color: #666; text-align: center;">No categories available</p>';
                }
                if (homeGrid) {
                    homeGrid.innerHTML = '<p class="sq-home-categories-empty">No categories available</p>';
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

// Render categories in header + home grid (app-like)
function escapeHtmlText(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderHomeCategoriesGrid(categories) {
    const grid = document.getElementById('homeCategoriesGrid');
    if (!grid || !categories || !categories.length) return;

    grid.innerHTML = categories.map(function (category) {
        const slug = generateCategorySlug(category.name);
        const shortId = category._id.toString().substring(0, 6);
        const categoryUrl = '/category/' + slug + '-' + shortId;
        const name = escapeHtmlText(category.name);
        const img = category.image
            ? '<img src="' + escapeHtmlText(category.image) + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
              '<span class="sq-home-cat-card__fallback" style="display:none" aria-hidden="true"><i class="fas fa-spa"></i></span>'
            : '<span class="sq-home-cat-card__fallback" aria-hidden="true"><i class="fas fa-spa"></i></span>';
        return (
            '<a href="' + categoryUrl + '" class="sq-home-cat-card">' +
            '<span class="sq-home-cat-card__media">' + img + '</span>' +
            '<span class="sq-home-cat-card__name">' + name + '</span>' +
            '</a>'
        );
    }).join('');
}

function renderCategories(categories) {
    const desktopMenu = document.getElementById('categoriesMenu');
    const mobileMenu = document.getElementById('mobileCategories');

    renderHomeCategoriesGrid(categories);

    const categoriesHtml = categories.map(category => {
        const slug = generateCategorySlug(category.name);
        const shortId = category._id.toString().substring(0, 6);
        const categoryUrl = `/category/${slug}-${shortId}`;
        return `<a href="${categoryUrl}" class="category-link">${category.name}</a>`;
    }).join('');
    
    // Get current language for the switcher button
    const currentLang = localStorage.getItem('skedisy-language') || 'fr';
    const switchToLang = currentLang === 'fr' ? 'en' : 'fr';
    const displayLang = currentLang === 'fr' ? 'FR' : 'EN';

    if (desktopMenu) {
        desktopMenu.innerHTML = categoriesHtml +
            '<span class="nav-menu-actions">' +
            '<a href="/blog/" class="nav-btn" data-translate="nav.blog">Blog</a>' +
            `<button type="button" class="nav-btn lang-switcher desktop-only" data-lang="${switchToLang}">` +
            `<i class="fas fa-globe"></i> <span>${displayLang}</span></button>` +
            '</span>';
    }

    if (mobileMenu) {
    mobileMenu.innerHTML = categories.map(category => {
        const slug = generateCategorySlug(category.name);
        const shortId = category._id.toString().substring(0, 6);
        const categoryUrl = `/category/${slug}-${shortId}`;
        return `<a href="${categoryUrl}" class="category-link">${category.name}</a>`;
    }).join('');
    }

    const activeMenu = document.getElementById('mobileMenu');
    if (activeMenu && activeMenu.classList.contains('active')) {
        activeMenu.style.height = 'auto';
    }
    
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
        android: 'https://play.google.com/store/apps/details?id=com.skedisy.expert&hl=fr',
        ios: 'https://apps.apple.com/fr/app/skedisy-xp/id6752965522'
    }
};

function buildStoreBadgesHtml(appType) {
    const links = APP_DOWNLOAD_LINKS[appType] || APP_DOWNLOAD_LINKS.customer;
    return (
        '<a class="sq-store-badge sq-store-badge--play" href="' + links.android + '" target="_blank" rel="noopener noreferrer" aria-label="Google Play">' +
        '<span class="sq-store-badge-icon" aria-hidden="true"><i class="fab fa-google-play"></i></span>' +
        '<span class="sq-store-badge-text">' +
        '<small data-translate="store.availableOn">Disponible sur</small>' +
        '<strong data-translate="store.googlePlay">Google Play</strong>' +
        '</span></a>' +
        '<a class="sq-store-badge sq-store-badge--apple" href="' + links.ios + '" target="_blank" rel="noopener noreferrer" aria-label="App Store">' +
        '<span class="sq-store-badge-icon" aria-hidden="true"><i class="fab fa-apple"></i></span>' +
        '<span class="sq-store-badge-text">' +
        '<small data-translate="store.availableOnAppStore">Disponible sur l\'</small>' +
        '<strong data-translate="store.appStore">App Store</strong>' +
        '</span></a>'
    );
}

function mountStoreBadges() {
    document.querySelectorAll('.sq-store-badges-mount').forEach(function (mount) {
        const appType = mount.getAttribute('data-app') || 'customer';
        const onDark = mount.getAttribute('data-variant') === 'on-dark';
        mount.className = 'sq-store-badges' + (onDark ? ' sq-store-badges--on-dark' : '');
        if (mount.getAttribute('data-center') === 'true') {
            mount.classList.add('sq-store-badges--center');
        }
        mount.setAttribute('data-app', appType);
        mount.innerHTML = buildStoreBadgesHtml(appType);
    });
}

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