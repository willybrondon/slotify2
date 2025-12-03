/**
 * Cookie Consent Manager for Skedisy.com
 * GDPR, CCPA, and ePrivacy Directive Compliant
 */

(function() {
    'use strict';

    // Cookie categories
    const COOKIE_CATEGORIES = {
        ESSENTIAL: 'essential',
        FUNCTIONAL: 'functional',
        ANALYTICS: 'analytics',
        MARKETING: 'marketing'
    };

    // Cookie consent storage key
    const CONSENT_COOKIE_NAME = 'skedisy_cookie_consent';
    const CONSENT_COOKIE_EXPIRY = 365; // days

    /**
     * Cookie Consent Manager Class
     */
    class CookieConsentManager {
        constructor() {
            this.consent = this.loadConsent();
            this.init();
        }

        /**
         * Initialize cookie consent system
         */
        init() {
            if (!this.hasConsent()) {
                this.showConsentBanner();
            } else {
                this.applyConsent();
            }
            this.setupPreferencesButton();
        }

        /**
         * Load consent from cookie
         */
        loadConsent() {
            const consentCookie = this.getCookie(CONSENT_COOKIE_NAME);
            if (consentCookie) {
                try {
                    return JSON.parse(decodeURIComponent(consentCookie));
                } catch (e) {
                    console.error('Error parsing consent cookie:', e);
                    return null;
                }
            }
            return null;
        }

        /**
         * Check if user has given consent
         */
        hasConsent() {
            return this.consent !== null && this.consent !== undefined;
        }

        /**
         * Show consent banner
         */
        showConsentBanner() {
            // Create banner HTML
            const banner = document.createElement('div');
            banner.id = 'cookie-consent-banner';
            banner.className = 'cookie-consent-banner';
            banner.innerHTML = `
                <div class="cookie-consent-content">
                    <div class="cookie-consent-text">
                        <h3>🍪 We Value Your Privacy</h3>
                        <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies. You can manage your preferences at any time.</p>
                        <p class="cookie-consent-links">
                            <a href="cookies.html" target="_blank">Cookie Policy</a> | 
                            <a href="privacy.html" target="_blank">Privacy Policy</a>
                        </p>
                    </div>
                    <div class="cookie-consent-buttons">
                        <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Accept All</button>
                        <button id="cookie-reject-all" class="cookie-btn cookie-btn-secondary">Reject All</button>
                        <button id="cookie-customize" class="cookie-btn cookie-btn-link">Customize</button>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);

            // Add event listeners with error handling
            const acceptAllBtn = document.getElementById('cookie-accept-all');
            const rejectAllBtn = document.getElementById('cookie-reject-all');
            const customizeBtn = document.getElementById('cookie-customize');

            if (acceptAllBtn) {
                acceptAllBtn.addEventListener('click', () => {
                    this.acceptAll();
                });
            }

            if (rejectAllBtn) {
                rejectAllBtn.addEventListener('click', () => {
                    this.rejectAll();
                });
            }

            if (customizeBtn) {
                customizeBtn.addEventListener('click', () => {
                    this.showPreferencesModal();
                });
            }

            // Animate banner in
            setTimeout(() => {
                banner.classList.add('show');
            }, 100);
        }

        /**
         * Show preferences modal
         */
        showPreferencesModal() {
            const modal = document.createElement('div');
            modal.id = 'cookie-preferences-modal';
            modal.className = 'cookie-preferences-modal';
            modal.innerHTML = `
                <div class="cookie-preferences-content">
                    <div class="cookie-preferences-header">
                        <h2>Cookie Preferences</h2>
                        <button class="cookie-close-btn" id="cookie-close-modal">&times;</button>
                    </div>
                    <div class="cookie-preferences-body">
                        <p>Manage your cookie preferences. You can enable or disable different types of cookies below.</p>
                        
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>Essential Cookies</h3>
                                    <p>These cookies are necessary for the website to function and cannot be switched off.</p>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" checked disabled>
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                            <p class="cookie-category-desc">Required for basic site functionality, security, and compliance.</p>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>Functional Cookies</h3>
                                    <p>These cookies enable enhanced functionality and personalization.</p>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="cookie-functional" ${(this.consent && this.consent.functional) ? 'checked' : ''}>
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                            <p class="cookie-category-desc">Remember your preferences and settings for a better experience.</p>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>Analytics Cookies</h3>
                                    <p>These cookies help us understand how visitors interact with our website.</p>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="cookie-analytics" ${(this.consent && this.consent.analytics) ? 'checked' : ''}>
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                            <p class="cookie-category-desc">We use analytics to improve our website performance and user experience.</p>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>Marketing Cookies</h3>
                                    <p>These cookies are used to deliver relevant advertisements.</p>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="cookie-marketing" ${(this.consent && this.consent.marketing) ? 'checked' : ''}>
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                            <p class="cookie-category-desc">Used to track visitors across websites for marketing purposes.</p>
                        </div>
                    </div>
                    <div class="cookie-preferences-footer">
                        <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">Save Preferences</button>
                        <button id="cookie-accept-all-modal" class="cookie-btn cookie-btn-secondary">Accept All</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add event listeners with error handling
            const closeBtn = document.getElementById('cookie-close-modal');
            const saveBtn = document.getElementById('cookie-save-preferences');
            const acceptAllBtn = document.getElementById('cookie-accept-all-modal');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closePreferencesModal();
                });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveCustomPreferences();
                });
            }

            if (acceptAllBtn) {
                acceptAllBtn.addEventListener('click', () => {
                    this.acceptAll();
                });
            }

            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePreferencesModal();
                }
            });

            // Close on Escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closePreferencesModal();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);

            // Animate modal in
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }

        /**
         * Close preferences modal
         */
        closePreferencesModal() {
            const modal = document.getElementById('cookie-preferences-modal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        }

        /**
         * Accept all cookies
         */
        acceptAll() {
            const consent = {
                essential: true,
                functional: true,
                analytics: true,
                marketing: true,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            this.saveConsent(consent);
            this.applyConsent();
            this.hideBanner();
            this.closePreferencesModal();
            this.logConsent('accept_all', consent);
        }

        /**
         * Reject all non-essential cookies
         */
        rejectAll() {
            const consent = {
                essential: true,
                functional: false,
                analytics: false,
                marketing: false,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            this.saveConsent(consent);
            this.applyConsent();
            this.hideBanner();
            this.logConsent('reject_all', consent);
        }

        /**
         * Save custom preferences
         */
        saveCustomPreferences() {
            const functionalCheckbox = document.getElementById('cookie-functional');
            const analyticsCheckbox = document.getElementById('cookie-analytics');
            const marketingCheckbox = document.getElementById('cookie-marketing');

            const consent = {
                essential: true, // Always true
                functional: functionalCheckbox ? functionalCheckbox.checked : false,
                analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
                marketing: marketingCheckbox ? marketingCheckbox.checked : false,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            this.saveConsent(consent);
            this.applyConsent();
            this.hideBanner();
            this.closePreferencesModal();
            this.logConsent('custom', consent);
        }

        /**
         * Save consent to cookie
         */
        saveConsent(consent) {
            this.consent = consent;
            const cookieValue = encodeURIComponent(JSON.stringify(consent));
            this.setCookie(CONSENT_COOKIE_NAME, cookieValue, CONSENT_COOKIE_EXPIRY);
        }

        /**
         * Apply consent preferences
         */
        applyConsent() {
            if (!this.consent) return;

            // Essential cookies are always enabled
            if (this.consent.essential) {
                // Essential cookies are already set
            }

            // Functional cookies
            if (this.consent.functional) {
                // Enable functional features
                this.enableFunctionalCookies();
            } else {
                this.disableFunctionalCookies();
            }

            // Analytics cookies
            if (this.consent.analytics) {
                this.enableAnalytics();
            } else {
                this.disableAnalytics();
            }

            // Marketing cookies
            if (this.consent.marketing) {
                this.enableMarketing();
            } else {
                this.disableMarketing();
            }
        }

        /**
         * Enable functional cookies
         */
        enableFunctionalCookies() {
            // Add functional cookie logic here
            // Example: Remember user preferences, language settings, etc.
        }

        /**
         * Disable functional cookies
         */
        disableFunctionalCookies() {
            // Remove functional cookies
            this.deleteCookie('user_preferences');
        }

        /**
         * Enable analytics
         */
        enableAnalytics() {
            // Initialize Google Analytics or other analytics tools
            // Example: gtag('consent', 'update', { 'analytics_storage': 'granted' });
            
            // You can add Google Analytics initialization here
            // if (typeof gtag !== 'undefined') {
            //     gtag('consent', 'update', {
            //         'analytics_storage': 'granted'
            //     });
            // }
        }

        /**
         * Disable analytics
         */
        disableAnalytics() {
            // Disable analytics tracking
            // if (typeof gtag !== 'undefined') {
            //     gtag('consent', 'update', {
            //         'analytics_storage': 'denied'
            //     });
            // }
        }

        /**
         * Enable marketing cookies
         */
        enableMarketing() {
            // Enable marketing/tracking cookies
            // Example: Facebook Pixel, Google Ads, etc.
        }

        /**
         * Disable marketing cookies
         */
        disableMarketing() {
            // Disable marketing tracking
        }

        /**
         * Hide consent banner
         */
        hideBanner() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => {
                    banner.remove();
                }, 300);
            }
        }

        /**
         * Setup preferences button in footer
         */
        setupPreferencesButton() {
            // Update footer links to open preferences modal (but not links to cookies.html)
            const cookieLinks = document.querySelectorAll('a[href*="Cookie"], a[href*="cookie"]');
            cookieLinks.forEach(link => {
                // Only intercept links that don't go to cookies.html
                if (link.href && !link.href.includes('cookies.html')) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showPreferencesModal();
                    });
                }
            });
        }

        /**
         * Log consent for compliance
         */
        logConsent(action, consent) {
            // Log consent to backend for compliance records
            // This should be sent to your backend API
            const consentLog = {
                action: action,
                consent: consent,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };

            // Send to backend (implement your API endpoint)
            // fetch('/api/consent-log', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(consentLog)
            // }).catch(err => console.error('Failed to log consent:', err));

            console.log('Consent logged:', consentLog);
        }

        /**
         * Get cookie value
         */
        getCookie(name) {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        }

        /**
         * Set cookie
         */
        setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            // Use Secure flag only if site is using HTTPS
            const isSecure = window.location.protocol === 'https:';
            const secureFlag = isSecure ? ';Secure' : '';
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`;
        }

        /**
         * Delete cookie
         */
        deleteCookie(name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        }

        /**
         * Get current consent status
         */
        getConsentStatus() {
            return this.consent;
        }
    }

    // Initialize cookie consent manager when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cookieConsentManager = new CookieConsentManager();
        });
    } else {
        window.cookieConsentManager = new CookieConsentManager();
    }

    // Export for global access
    window.CookieConsentManager = CookieConsentManager;
})();

