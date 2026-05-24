/**
 * Footer harmonisé pour pages légales (privacy, terms, cookies).
 */
function mountLegalFooter() {
    var mount = document.getElementById("legal-footer-mount");
    if (!mount || mount.dataset.mounted === "1") return;
    mount.dataset.mounted = "1";

    mount.innerHTML =
        '<footer class="footer sq-footer">' +
        '<div class="container">' +
        '<div class="footer-content">' +
        '<div class="footer-section">' +
        "<h3>Skedisy</h3>" +
        '<p data-translate="footer.clientTagline">La réservation pour la communauté afro en Île-de-France.</p>' +
        '<div class="contact-info">' +
        '<p><i class="fas fa-envelope"></i> support@skedisy.com</p>' +
        '<p><a href="https://wa.me/33766160394" class="btn-whatsapp-inline" target="_blank" rel="noopener noreferrer" data-translate="footer.whatsapp">' +
        '<i class="fab fa-whatsapp"></i> WhatsApp</a></p>' +
        "</div>" +
        '<div class="footer-social">' +
        '<h4 data-translate="footer.followUs">Suivez-nous</h4>' +
        '<div class="footer-social-links">' +
        '<a href="https://www.facebook.com/profile.php?id=61586655939283" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>' +
        '<a href="https://www.instagram.com/skedisy/" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>' +
        '<a href="https://www.tiktok.com/@skedisy" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>' +
        "</div></div></div>" +
        '<div class="footer-section">' +
        '<h4 data-translate="footer.about">À propos</h4>' +
        "<ul>" +
        '<li><a href="/">Accueil</a></li>' +
        '<li><a href="/blog/" data-translate="nav.blog">Blog</a></li>' +
        '<li><a href="/professionnel/" data-translate="nav.pro">Pro</a></li>' +
        '<li><a href="https://skedisy.com/salonpanel/" data-translate="nav.login">Connexion</a></li>' +
        "</ul></div>" +
        '<div class="footer-section">' +
        '<h4 data-translate="footer.legal">Mentions</h4>' +
        "<ul>" +
        '<li><a href="/terms/" data-translate="footer.terms">CGU</a></li>' +
        '<li><a href="/privacy/" data-translate="footer.privacy">Confidentialité</a></li>' +
        '<li><a href="/cookies/" data-translate="footer.cookies">Cookies</a></li>' +
        "</ul></div></div>" +
        '<div class="footer-bottom">' +
        '<p data-translate="footer.rights">&copy; 2024 Skedisy. All rights reserved.</p>' +
        "</div></div></footer>";

    if (typeof translatePage === "function") {
        translatePage();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountLegalFooter);
} else {
    mountLegalFooter();
}
