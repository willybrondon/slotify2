/**
 * Vérification statique — accueil / recherche style Squire.
 * Usage: node verify-home-search.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const pages = ["index.html", "search-results.html"];
const cssFiles = ["intent-hub.css", "styles.css"];
const jsFiles = ["location-chip.js", "search-suggestions.js", "script.js", "search-results-page.js"];

let pass = 0;
let fail = 0;
let warn = 0;

function ok(msg) {
    pass++;
    console.log("  ✓ " + msg);
}
function bad(msg) {
    fail++;
    console.log("  ✗ " + msg);
}
function note(msg) {
    warn++;
    console.log("  ! " + msg);
}

function read(file) {
    return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function extractBlock(html, id) {
    const re = new RegExp(`id="${id}"[\\s\\S]*?<\\/div>`, "i");
    const m = html.match(re);
    return m ? m[0] : "";
}

console.log("\n=== Vérification web Squire (Skedisy) ===\n");

for (const page of pages) {
    console.log(`Page: ${page}`);
    const html = read(page);

    const menuBlock = html.match(/<div class="mobile-menu-content[\s\S]*?<\/div>\s*<\/div>\s*<\/nav>/i);
    const menuHtml = menuBlock ? menuBlock[0] : "";
    if (menuHtml.includes("homeLocationChip") || menuHtml.includes("sq-location-chip")) {
        bad(`${page}: puce localisation trouvée dans le menu hamburger`);
    } else {
        ok(`${page}: puce localisation absente du hamburger`);
    }

    const required = [
        "homeLocationChip",
        "homeLocationPopover",
        "homeLocationSearchInput",
        "homeLocationApply",
        "homeLocationChipValue",
        "sq-search-suggestions",
        "data-suggest-categories",
        "data-suggest-services",
        "homeViewMapLink",
        "location-chip.js",
        "search-suggestions.js",
    ];
    for (const id of required) {
        if (html.includes(id)) ok(`${page}: présent « ${id} »`);
        else bad(`${page}: manquant « ${id} »`);
    }

    if (page === "index.html") {
        if (html.includes("sqNearbySalons") || html.includes("sqTopExperts")) {
            bad("index.html: sections nearby/experts encore présentes");
        } else ok("index.html: sections nearby/experts retirées");
        if (html.includes("sq-search-hero-toolbar")) ok(`${page}: barre outils position/carte`);
        else bad(`${page}: sq-search-hero-toolbar manquant`);
    }

    if (html.includes('data-search-unified')) ok(`${page}: barre recherche unifiée`);
    else bad(`${page}: data-search-unified manquant`);

    const chipPos = html.indexOf("sq-location-chip");
    const searchPos = html.indexOf("data-search-unified");
    if (chipPos > -1 && searchPos > -1 && chipPos < searchPos) {
        ok(`${page}: puce avant barre de recherche dans le DOM`);
    } else {
        bad(`${page}: ordre puce / recherche incorrect`);
    }

    console.log("");
}

const intentCss = read("intent-hub.css");
if (intentCss.includes("padding-right: 200px") && intentCss.includes(".sq-search-hero-wrap")) {
    ok("CSS desktop: padding-right anti-chevauchement QR");
} else {
    bad("CSS desktop: padding-right QR manquant");
}
if (intentCss.includes("sq-search-hero-toolbar") && intentCss.includes("justify-content: space-between")) {
    ok("CSS: toolbar position gauche / carte droite");
} else {
    bad("CSS: toolbar extremités manquant");
}
if (intentCss.includes("order: -1") && intentCss.includes("sq-search-bar-unified--home")) {
    ok("CSS mobile: bouton recherche à gauche");
} else {
    bad("CSS mobile: bouton recherche à gauche manquant");
}
if (intentCss.includes("flex-direction: column") && intentCss.includes(".sq-search-hero")) {
    ok("CSS: colonne mobile puce au-dessus recherche");
} else {
    bad("CSS: layout colonne mobile manquant");
}

const stylesCss = read("styles.css");
if (stylesCss.match(/@media[\s\S]*?\.qr-topright[\s\S]*?display:\s*none/i)) {
    ok("CSS: QR masqué sur mobile");
} else {
    note("CSS: règle masquage QR mobile non détectée explicitement");
}

const lang = read("language.js");
for (const key of ["yourLocation", "applyLocation", "viewMap", "nearYou"]) {
    const fr = lang.includes(`'homeProduct.${key}':`) && lang.split(`'homeProduct.${key}':`).length > 2;
    if (lang.includes(`homeProduct.${key}`)) ok(`i18n: homeProduct.${key}`);
    else bad(`i18n: homeProduct.${key} manquant`);
}

const chipJs = read("location-chip.js");
if (chipJs.includes("skedisyGetLocationLabel")) ok("location-chip.js: API getLabel exportée");
else bad("location-chip.js: skedisyGetLocationLabel manquante");
if (chipJs.includes("localStorage.setItem(STORAGE_KEY")) ok("location-chip.js: persistance localStorage");
else bad("location-chip.js: localStorage manquant");

const scriptJs = read("script.js");
if (scriptJs.includes("skedisyGetLocationLabel")) ok("script.js: recherche utilise getLabel");
else bad("script.js: skedisyGetLocationLabel non utilisé");

const resultsJs = read("search-results-page.js");
if (resultsJs.includes('params.get("view") === "map"')) ok("search-results: ?view=map supporté");
else bad("search-results: view=map manquant");

console.log("\n--- Résumé ---");
console.log(`  OK: ${pass}  Échecs: ${fail}  Notes: ${warn}`);
process.exit(fail > 0 ? 1 : 0);
