/**
 * Nav minimale alignée site marketing pour pages légales (conserve le sélecteur de langue).
 */
function patchLegalNav() {
    var nav = document.querySelector("nav.navbar .nav-container");
    if (!nav || nav.dataset.legalNavReady === "1") return;
    nav.dataset.legalNavReady = "1";

    var logo = nav.querySelector(".nav-logo a");
    if (logo) logo.setAttribute("href", "/");

    var center = nav.querySelector(".nav-menu-center");
    if (center) {
        var docLink = center.querySelector('a[href*="docs"]');
        if (docLink) {
            docLink.setAttribute("href", "/blog/");
            docLink.className = "nav-btn";
            docLink.setAttribute("data-translate", "nav.blog");
            docLink.classList.remove("documentation-link");
        }
        if (!center.querySelector('a[href="/"]')) {
            var home = document.createElement("a");
            home.href = "/";
            home.className = "nav-btn";
            home.textContent = "Accueil";
            center.insertBefore(home, center.firstChild);
        }
        if (!center.querySelector('a[href="/professionnel/"]')) {
            var pro = document.createElement("a");
            pro.href = "/professionnel/";
            pro.className = "nav-btn";
            pro.setAttribute("data-translate", "nav.pro");
            pro.textContent = "Pro";
            var langBtn = center.querySelector(".lang-switcher");
            if (langBtn) {
                center.insertBefore(pro, langBtn);
            } else {
                center.appendChild(pro);
            }
        }
    }

    var login = nav.querySelector(".btn-login-mobile");
    if (login) {
        login.setAttribute("href", "https://skedisy.com/salonpanel/");
        login.removeAttribute("style");
    }

    if (typeof translatePage === "function") {
        translatePage();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchLegalNav);
} else {
    patchLegalNav();
}
