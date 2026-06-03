/**
 * Remplace les libellés EN courants dans dialogues / formulaires modaux.
 */
const fs = require("fs");
const path = require("path");

const SALON_UI = "SKEDISY_SALON_UI";
const ADMIN_UI = "SKEDISY_ADMIN_UI";

const REPLACEMENTS = [
  ["`Add expert`", "ui.pages.addExpert"],
  ["`Add Expert`", "ui.pages.addExpert"],
  ["`Add product`", "ui.pages.addProduct"],
  ["Select services", "ui.dialog.selectServices"],
  ["Select Services", "ui.dialog.selectServices"],
  ["Select Salon", "ui.dialog.selectSalon"],
  ["Select salon", "ui.dialog.selectSalon"],
  ["Select Category", "ui.dialog.selectCategory"],
  ["Select a category", "ui.dialog.selectCategoryHint"],
  ["Select Attribute", "ui.dialog.selectAttribute"],
  ["Select (Multiple) Image", "ui.dialog.selectImages"],
  ["Enter Price", "ui.dialog.enterPrice"],
  ["Enter Name", "ui.dialog.enterName"],
  ["Enter name", "ui.dialog.enterName"],
  ["Enter detail", "ui.dialog.enterDetail"],
  ["Enter Duration", "ui.dialog.enterDuration"],
  ["placeholder={`Reason`}", "placeholder={ui.dialog.reason}"],
  ['placeholder="Enter Price"', 'placeholder={ui.dialog.enterPrice}'],
  ['placeholder="Enter Name"', 'placeholder={ui.dialog.enterName}'],
  ['placeholder="Enter name"', 'placeholder={ui.dialog.enterName}'],
  ['placeholder="Enter detail"', 'placeholder={ui.dialog.enterDetail}'],
  ['placeholder="Enter Duration"', 'placeholder={ui.dialog.enterDuration}'],
  ["Price cannot be greater than MRP", "ui.dialog.priceAboveMrp"],
  ["First Name Is Required", "ui.dialog.firstNameRequired"],
  ["Last name Is Required", "ui.dialog.lastNameRequired"],
  ["Last name is required", "ui.dialog.lastNameRequired"],
  ["First name is required", "ui.dialog.firstNameRequired"],
  ["Mobile Number Is Required", "ui.dialog.mobileRequired"],
  ["Mobile number is required", "ui.dialog.mobileRequired"],
  ["Mobile number must be 6 to 13 digits", "ui.dialog.mobileInvalid"],
  ["Gender Is Required", "ui.dialog.genderRequired"],
  ["Gender is required", "ui.dialog.genderRequired"],
  ["Email is required", "ui.dialog.emailRequired"],
  ["Email address is invalid", "ui.dialog.emailInvalid"],
  ["Image is required!", "ui.dialog.imageRequired"],
  ["Age is required", "ui.dialog.ageRequired"],
  ["Invalid Age", "ui.dialog.ageInvalid"],
  ["Commission is required", "ui.dialog.commissionRequired"],
  ["Invalid Commission", "ui.dialog.commissionInvalid"],
  ["Password is required", "ui.dialog.passwordRequired"],
  ["At least one service must be selected", "ui.dialog.servicePickRequired"],
  ["Title Is Required", "ui.dialog.titleRequired"],
  ["Message Is Required", "ui.dialog.messageRequired"],
  ["Reason is required", "ui.dialog.reasonRequired"],
  ["`Reason is required`", "ui.dialog.reasonRequired"],
  ["label={`Reason`}", "label={ui.dialog.reason}"],
  ["errorMessage={`Enter Name`}", "errorMessage={ui.dialog.enterName}"],
  ["Enter Correct duration", "ui.dialog.durationInvalid"],
  ["Enter Correct price", "ui.dialog.priceInvalid"],
];

const DIALOG_KEYS = `
    selectServices: "Choisir les prestations",
    selectSalon: "Choisir le salon",
    selectCategory: "Choisir la catégorie",
    selectCategoryHint: "Sélectionnez une catégorie",
    selectAttribute: "Choisir un attribut",
    selectImages: "Photos (plusieurs)",
    enterDuration: "Durée (minutes)",
    firstNameRequired: "Le prénom est requis.",
    lastNameRequired: "Le nom est requis.",
    mobileRequired: "Le téléphone est requis.",
    mobileInvalid: "Le numéro doit comporter 6 à 13 chiffres.",
    genderRequired: "Le genre est requis.",
    emailRequired: "L'email est requis.",
    emailInvalid: "Adresse email invalide.",
    imageRequired: "La photo est requise.",
    ageRequired: "L'âge est requis.",
    ageInvalid: "Âge invalide (18–100).",
    commissionRequired: "La commission est requise.",
    commissionInvalid: "Commission invalide (0–99 %).",
    passwordRequired: "Le mot de passe est requis.",
    servicePickRequired: "Sélectionnez au moins une prestation.",
    titleRequired: "Le titre est requis.",
    messageRequired: "Le message est requis.",
    durationInvalid: "Durée invalide.",
    priceInvalid: "Prix invalide.",
`;

function mergeDialogKeys(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (c.includes("selectServices:")) return;
  c = c.replace(/detailsRequired: "[^"]+",/, (m) => m + DIALOG_KEYS);
  fs.writeFileSync(copyPath, c);
  console.log("keys", path.basename(copyPath));
}

function walk(d, a = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (p.endsWith(".js")) a.push(p);
  }
  return a;
}

function ensureUiImport(filePath, app, c) {
  if (c.includes("skedisyUiCopy")) return c;
  const rel = path
    .relative(
      path.dirname(filePath),
      path.join(path.dirname(filePath), "..", "..", "constants", "skedisyUiCopy.js")
    )
    .replace(/\\/g, "/")
    .replace(/\.js$/, "");
  const fixedRel = path
    .relative(path.dirname(filePath), path.join(__dirname, "..", app, "src", "constants", "skedisyUiCopy.js"))
    .replace(/\\/g, "/")
    .replace(/\.js$/, "");
  const exportName = app === "salon" ? SALON_UI : ADMIN_UI;
  const line = `import { ${exportName} as ui } from "${fixedRel}";\n`;
  const m = c.match(/^import .+;\r?\n/m);
  if (m) {
    const idx = c.indexOf(m[0]) + m[0].length;
    return c.slice(0, idx) + line + c.slice(idx);
  }
  return line + c;
}

const root = path.join(__dirname, "..");
mergeDialogKeys(path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"));
mergeDialogKeys(path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"));

let n = 0;
for (const app of ["salon", "frontend"]) {
  const comp = path.join(root, app, "src", "component");
  for (const f of walk(comp)) {
    if (!/Dialog|Dialogue|CancleDetails|ExpertDialogue|WithDrawMoney/.test(f)) continue;
    let c = fs.readFileSync(f, "utf8");
    let changed = false;
    for (const [from, to] of REPLACEMENTS) {
      if (c.includes(from)) {
        c = c.split(from).join(to);
        changed = true;
      }
    }
    if (!changed) continue;
    c = ensureUiImport(f, app, c);
    fs.writeFileSync(f, c);
    n++;
    console.log(app, path.relative(comp, f));
  }
}
console.log("done", n);
