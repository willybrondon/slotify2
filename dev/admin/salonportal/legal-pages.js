/**
 * En-tête et pied de page communs aux pages légales (alignés sur index.html).
 * Définir window.SKEDISY_ASSET_BASE avant ce script ('..' dans terms/, privacy/, cookies/).
 */
(function () {
  const base = window.SKEDISY_ASSET_BASE || ".";
  const home = base === ".." ? "/" : "index.html";
  const prefix = base === ".." ? base + "/" : "";

  function asset(path) {
    if (path.startsWith("/") || path.startsWith("http")) return path;
    return prefix + path;
  }

  const headerHtml = `
    <div class="login-above-qr header-actions-above-qr">
        <a href="/professionnel/" class="btn-nav-above btn-pro-above" data-translate="nav.pro">Pro</a>
        <a href="/compte/connexion" class="btn-login-above" data-translate="nav.login">Connexion</a>
    </div>
    <div class="qr-topright qr-topright--client">
        <div class="qr-top-flex">
            <div class="qr-top-block" id="download-customer" data-app-type="customer" onclick="openPhoneSelection('customer')">
                <div class="qr-code-wrapper"><div id="qr-customer-top"></div></div>
                <div class="qr-label" data-translate="qr.customerApp">Télécharger l'app cliente</div>
            </div>
        </div>
    </div>
    <nav class="navbar sq-navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="${home}" style="text-decoration: none; color: inherit;"><h2>Skedisy</h2></a>
            </div>
            <div class="nav-menu-center desktop-only" id="categoriesMenu"></div>
            <div class="mobile-menu-wrapper">
                <div class="hamburger mobile-only" id="mobileMenuToggle"><span></span><span></span><span></span></div>
            </div>
        </div>
        <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
        <div class="mobile-menu" id="mobileMenu">
            <div class="mobile-menu-header">
                <h3 data-translate="nav.forClients">Pour les clientes</h3>
                <div class="mobile-menu-header-right">
                    <button class="lang-switcher mobile-only" data-lang="en" title="Passer en anglais"><i class="fas fa-globe"></i> <span>FR</span></button>
                    <button class="mobile-menu-close" id="mobileMenuClose" type="button" aria-label="Fermer">&times;</button>
                </div>
            </div>
            <div class="mobile-menu-content mobile-menu-content--client">
                <a href="/compte/connexion" class="btn-login-mobile-menu" data-translate="nav.login">Connexion</a>
                <button type="button" class="btn-login-mobile-menu btn-mobile-action" data-mobile-download="customer" data-translate="client.downloadAppCta">Télécharger l'app</button>
                <div class="mobile-categories-panel">
                    <button type="button" class="btn-login-mobile-menu mobile-categories-toggle" id="mobileCategoriesToggle" aria-expanded="false" aria-controls="mobileCategoriesDrawer">
                        <span data-translate="nav.allCategories">Toutes les catégories</span>
                        <i class="fas fa-chevron-down mobile-categories-toggle__icon" aria-hidden="true"></i>
                    </button>
                    <div class="mobile-categories-drawer" id="mobileCategoriesDrawer" hidden>
                        <div class="mobile-categories-drawer__head">
                            <span data-translate="nav.allCategories">Toutes les catégories</span>
                            <button type="button" class="mobile-categories-drawer__close" id="mobileCategoriesClose" aria-label="Fermer">&times;</button>
                        </div>
                        <div class="mobile-categories" id="mobileCategories"></div>
                    </div>
                </div>
                <a href="/professionnel/" class="btn-login-mobile-menu btn-for-business-mobile" data-translate="nav.forBusiness">Pour les professionnels</a>
            </div>
        </div>
    </nav>
    <div class="sq-mobile-float-bar mobile-only" aria-label="Actions rapides">
        <a href="${asset("ai-concierge.html")}" class="floating-ai-btn" id="floatingAiBtn">
            <i class="fas fa-robot" aria-hidden="true"></i>
            <span data-translate="nav.aiConcierge">Concierge IA</span>
        </a>
        <a href="#" class="floating-download-btn floating-download-btn--customer" onclick="openPhoneSelection('customer'); return false;" data-translate="client.downloadAppCta">Télécharger l'app</a>
    </div>`;

  const footerHtml = `
    <footer class="footer sq-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Skedisy</h3>
                    <p data-translate="footer.clientTagline">La réservation pour la communauté afro en Île-de-France.</p>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> support@skedisy.com</p>
                        <p>
                            <a href="https://wa.me/33766160394" class="btn-whatsapp-inline" target="_blank" rel="noopener noreferrer" data-translate="footer.whatsapp">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </a>
                        </p>
                    </div>
                    <div class="footer-social">
                        <h4 data-translate="footer.followUs">Suivez-nous</h4>
                        <div class="footer-social-links">
                            <a href="https://www.facebook.com/profile.php?id=61586655939283" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Skedisy sur Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
                            <a href="https://www.instagram.com/skedisy/" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Skedisy sur Instagram"><i class="fab fa-instagram" aria-hidden="true"></i></a>
                            <a href="https://www.tiktok.com/@skedisy" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Skedisy sur TikTok"><i class="fab fa-tiktok" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>
                <div class="footer-section">
                    <h4 data-translate="footer.about">À propos</h4>
                    <ul>
                        <li><a href="#" onclick="openPhoneSelection('customer'); return false;" data-translate="client.downloadAppCta">Télécharger l'app</a></li>
                        <li><a href="${asset("ai-concierge.html")}" data-translate="nav.aiConcierge">Concierge IA</a></li>
                        <li><a href="/professionnel/" data-translate="nav.pro">Pro</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 data-translate="footer.legal">Mentions</h4>
                    <ul>
                        <li><a href="/terms/" data-translate="footer.terms">CGU</a></li>
                        <li><a href="/privacy/" data-translate="footer.privacy">Confidentialité</a></li>
                        <li><a href="/cookies/" id="cookie-management-link" data-translate="footer.cookies">Cookies</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p data-translate="footer.rights">&copy; 2026 Skedisy. Tous droits réservés.</p>
            </div>
        </div>
    </footer>
    <div id="phone-selection-modal" class="modal">
        <div class="modal-content phone-selection">
            <span class="close">&times;</span>
            <h2 id="modal-title" data-translate="modal.choosePlatform">Choisissez votre plateforme</h2>
            <p id="modal-description" data-translate="modal.selectDevice">Sélectionnez votre appareil pour télécharger l'app</p>
            <div class="phone-options">
                <div class="phone-option" data-platform="android">
                    <div class="store-logo"><i class="fab fa-google-play"></i></div>
                    <h3 data-translate="modal.android">Android</h3>
                    <p data-translate="modal.downloadAndroid">Télécharger sur Google Play</p>
                    <div class="download-link" id="android-link"><i class="fas fa-download"></i> <span data-translate="modal.download">Télécharger</span></div>
                </div>
                <div class="phone-option" data-platform="ios">
                    <div class="store-logo"><i class="fab fa-apple"></i></div>
                    <h3 data-translate="modal.iphone">iPhone</h3>
                    <p data-translate="modal.downloadIOS">Télécharger sur l'App Store</p>
                    <div class="download-link" id="ios-link"><i class="fas fa-download"></i> <span data-translate="modal.download">Télécharger</span></div>
                </div>
            </div>
        </div>
    </div>`;

  const headerMount = document.getElementById("sq-legal-header");
  const footerMount = document.getElementById("sq-legal-footer");
  if (headerMount) headerMount.innerHTML = headerHtml;
  if (footerMount) footerMount.innerHTML = footerHtml;
})();
