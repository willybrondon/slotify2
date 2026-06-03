/**
 * Dernière passe : expert, bonus, coupon, profil, libellés résiduels.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function patch(fileRel, edits) {
  const p = path.join(root, fileRel);
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, "utf8");
  let n = 0;
  for (const [from, to] of edits) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      n++;
    }
  }
  if (n) {
    fs.writeFileSync(p, c);
    console.log("patched", fileRel, n);
  }
}

// --- BonusPenaltyDialog (salon + frontend) ---
const bonusImportSalon =
  'import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";\n';
const bonusImportFrontend =
  'import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";\n';

for (const [rel, imp] of [
  ["salon/src/component/tables/BonusPenaltyDialog.js", bonusImportSalon],
  ["frontend/src/component/tables/BonusPenaltyDialog.js", bonusImportFrontend],
]) {
  const p = path.join(root, rel);
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes("skedisyUiCopy")) {
    c = c.replace(
      /import { bonusPenalty[^;]+;\n/,
      (m) => m + imp
    );
  }
  c = c
    .replace(
      /<h2 className="text-theme m0">[^<]+<\/h2>/,
      "<h2 className=\"text-theme m0\">{ui.bonusPenalty.title}</h2>"
    )
    .replace(
      'setError("Bonus or Penalty is required")',
      "setError(ui.bonusPenalty.required)"
    )
    .replace(
      /label=\{`Bonus\s+\(\$\{setting\?\.currencySymbol\}\)`\}/,
      "label={`${ui.bonusPenalty.bonus} (${setting?.currencySymbol})`}"
    )
    .replace(/placeholder=\{`Bonus`\}/, "placeholder={ui.bonusPenalty.bonus}")
    .replace(
      /label=\{`Penalty\s+\(\$\{setting\?\.currencySymbol\}\)`\}/,
      "label={`${ui.bonusPenalty.penalty} (${setting?.currencySymbol})`}"
    )
    .replace(/placeholder=\{`Penalty`\}/, "placeholder={ui.bonusPenalty.penalty}")
    .replace(/label=\{`Note`\}/, "label={ui.bonusPenalty.note}")
    .replace(/placeholder=\{`Note`\}/, "placeholder={ui.bonusPenalty.note}")
    .replace(
      /Note : you Can either give bonus or penalty\./,
      "{ui.bonusPenalty.hint}"
    );
  fs.writeFileSync(p, c);
  console.log("bonus", rel);
}

// --- ExpertDialogue labels ---
for (const rel of [
  "salon/src/component/tables/expert/ExpertDialogue.js",
  "frontend/src/component/tables/expert/ExpertDialogue.js",
]) {
  patch(rel, [
    ["label={`First name`}", "label={ui.table.firstName}"],
    ["placeholder={`First name`}", "placeholder={ui.table.firstName}"],
    ["label={`Last name`}", "label={ui.table.lastName}"],
    ["placeholder={`Last Name`}", "placeholder={ui.table.lastName}"],
    ["placeholder={`Last name`}", "placeholder={ui.table.lastName}"],
    ["fname: `First Name is required`", "fname: ui.dialog.firstNameRequired"],
    ["fname: `ui.dialog.firstNameRequired`", "fname: ui.dialog.firstNameRequired"],
  ]);
}

patch("salon/src/component/tables/expert/Expert.js", [
  ["text={`Add expert`}", "text={ui.pages.addExpert}"],
]);

patch("salon/src/component/pages/AdminProfile.js", [
  ['error.newPassword = "New password is required !"', "error.newPassword = portalCopy.newPasswordRequired"],
  ['error.confirmPassword = "Confirm password Is required !"', "error.confirmPassword = portalCopy.confirmPasswordRequired"],
  ['error.confirmPassword =\n          "New password and confirm password doesn\'t match"', "error.confirmPassword = portalCopy.passwordMismatch"],
  ['error.oldPassword = "Old password is required !"', "error.oldPassword = portalCopy.oldPasswordRequired"],
]);

patch("frontend/src/component/pages/AdminProfile.js", [
  ['error.image = "Image is required"', "error.image = portalCopy.imageRequired || ui.dialog.imageRequired"],
  ['oldPassword: "Old password is required !"', "oldPassword: portalCopy.oldPasswordRequired"],
  ['newPassword: "New password is required !"', "newPassword: portalCopy.newPasswordRequired"],
  ['"Confirm password is required !"', "portalCopy.confirmPasswordRequired"],
]);

// StaffEarning / SalonPayout headers
for (const rel of [
  "salon/src/component/tables/StaffEarning.js",
  "salon/src/component/tables/SalonPayout.js",
  "salon/src/component/tables/SalonEarnings.js",
]) {
  patch(rel, [
    ["Header: `Bonus / Penalty`", "Header: col.bonusPenalty"],
    ["Header: `Bonus/Penalty `", "Header: col.bonusPenalty"],
  ]);
}

patch("salon/src/component/tables/User/UserProfile.js", [
  ["label={`First name`}", "label={ui.table.firstName}"],
  ["label={`Last name`}", "label={ui.table.lastName}"],
]);

patch("salon/src/component/tables/services/ServiceDialogue.js", [
  ["name: ` Name is required`", "name: ui.dialog.nameRequiredBang"],
  ["duration: ` Duration is required`", "duration: ui.dialog.durationRequired"],
  ["price: ` Price is required`", "price: ui.dialog.priceRequired"],
]);

patch("frontend/src/component/tables/services/ServiceDialogue.js", [
  ["name: ` Name is required`", "name: ui.dialog.nameRequiredBang"],
  ["duration: ` Duration is required`", "duration: ui.dialog.durationRequired"],
  ["price: ` Price is required`", "price: ui.dialog.priceRequired"],
]);

patch("salon/src/component/tables/ProductCategory/ProductCategoryDialogue.js", [
  ["name: ` Name is required`", "name: ui.dialog.nameRequiredBang"],
]);

console.log("done final-pass patches");
