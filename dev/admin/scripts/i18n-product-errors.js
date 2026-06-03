const fs = require("fs");
const path = require("path");

const MAP = {
  '"Product code is required"': "ui.dialog.productCodeRequired",
  '"Product name is required"': "ui.dialog.productNameRequired",
  '"Description is required"': "ui.dialog.descriptionRequired",
  '"Brand is required"': "ui.dialog.brandRequired",
  '"Category is required"': "ui.dialog.categoryRequired",
  '"At least one attribute is required!"': "ui.dialog.attributeRequired",
  '"Price is required"': "ui.dialog.priceRequired",
  '"MRP is required"': "ui.dialog.mrpRequired",
  '"Shipping Charges is required"': "ui.dialog.shippingRequired",
  '"Main Image is required"': "ui.dialog.mainImageRequired",
  '"Image is required"': "ui.dialog.imagesRequired",
  '` Price is required`': "ui.dialog.priceRequired",
  '"Name is required!"': "ui.dialog.nameRequiredBang",
  '`Image is required`': "ui.dialog.imageRequiredCategory",
  '"Open Time is required"': "ui.dialog.openTimeRequired",
  '"Close TIme is required"': "ui.dialog.closeTimeRequired",
  '"Close Time is required"': "ui.dialog.closeTimeRequired",
  '"Name is required!"': "ui.dialog.nameRequiredBang",
  '"Date is required"': "ui.dialog.dateRequired",
  '"Salon is required"': "ui.dialog.salonRequired",
  '"End date is required"': "ui.dialog.endDateRequired",
  '`Salon is required`': "ui.dialog.salonRequired",
  '"Salon name is required"': "ui.dialog.salonRequired",
  '"Bank name is required"': "ui.dialog.bankNameRequired",
  '"Account number is required"': "ui.dialog.accountRequired",
  '"Branch name is required"': "ui.dialog.branchRequired",
  '"IFSC code is required"': "ui.dialog.ifscRequired",
  '"Upi id is required"': "ui.dialog.upiRequired",
  '` Name is required`': "ui.dialog.nameRequiredBang",
};

const EXTRA_KEYS = `
    dateRequired: "La date est requise.",
    salonRequired: "Le salon est requis.",
    endDateRequired: "La date de fin est requise.",
    bankNameRequired: "Le nom de la banque est requis.",
    accountRequired: "Le numéro de compte est requis.",
    branchRequired: "L'agence est requise.",
    ifscRequired: "Le code banque est requis.",
    upiRequired: "L'identifiant UPI est requis.",
`;

function mergeKeys(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (c.includes("dateRequired:")) return;
  c = c.replace(/adminEmailRequired: "[^"]+",/, (m) => m + EXTRA_KEYS);
  fs.writeFileSync(copyPath, c);
}

const root = path.join(__dirname, "..");
mergeKeys(path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"));
mergeKeys(path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"));

const files = [
  "salon/src/component/tables/products/ProductDialogue.js",
  "salon/src/component/tables/ProductCategory/productDialogue.js",
  "frontend/src/component/tables/products/ProductDialogue.js",
  "frontend/src/component/tables/ProductCategory/productDialogue.js",
  "salon/src/component/tables/services/ServiceDialogue.js",
  "salon/src/component/tables/attributes/AttributeDialogue.js",
  "salon/src/component/tables/category/CategoryDialogue.js",
  "salon/src/component/tables/timeSlot/TimeDialogue.js",
  "salon/src/component/tables/WithDrawDialogue.js",
  "frontend/src/component/tables/timeSlot/HolidayDialog.js",
  "frontend/src/component/tables/expert/ExpertDialogue.js",
];

for (const rel of files) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) continue;
  let c = fs.readFileSync(p, "utf8");
  let changed = false;
  for (const [from, to] of Object.entries(MAP)) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      changed = true;
    }
  }
  if (!changed) continue;
  if (!c.includes("skedisyUiCopy")) {
    const app = rel.startsWith("salon") ? "salon" : "frontend";
    const exportName = app === "salon" ? "SKEDISY_SALON_UI" : "SKEDISY_ADMIN_UI";
    const relImport = path
      .relative(path.dirname(p), path.join(root, app, "src", "constants", "skedisyUiCopy.js"))
      .replace(/\\/g, "/")
      .replace(/\.js$/, "");
    const line = `import { ${exportName} as ui } from "${relImport}";\n`;
    const m = c.match(/^import .+;\r?\n/m);
    if (m) {
      const idx = c.indexOf(m[0]) + m[0].length;
      c = c.slice(0, idx) + line + c.slice(idx);
    }
  }
  fs.writeFileSync(p, c);
  console.log("ok", rel);
}
