/**
 * Passe 2 : Setting admin (chemins Windows), titres, en-têtes, profils, AddSalon salon.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function norm(p) {
  return p.replace(/\\/g, "/");
}

function injectTableKeys(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  const adds = [];
  if (!c.includes("finalAmount:")) adds.push('    finalAmount: "Montant final",');
  if (!c.includes("salonEarning:")) adds.push('    salonEarning: "Gain salon",');
  if (!c.includes('date: "Date"')) adds.push('    date: "Date",');
  if (!c.includes("productCategoryDialog:")) {
    /* dialog in labels */
  }
  if (adds.length) {
    c = c.replace(/(createdAt: "[^"]+",)/, `$1\n${adds.join("\n")}`);
    fs.writeFileSync(copyPath, c);
    console.log("table keys", path.basename(copyPath));
  }
}

function injectLabelsKeys(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (!c.includes("expertWithdrawRequest:")) {
    c = c.replace(
      /(salonWithdrawRequest: "[^"]+",)/,
      '$1\n    expertWithdrawRequest: "Demandes de retrait pro",\n    productCategoryDialog: "Catégorie produit",'
    );
    fs.writeFileSync(copyPath, c);
  }
}

function injectSalonFormSalon(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (c.includes("salonForm:")) return;
  const block = `  salonForm: {
    addTitle: "Ajouter un salon",
    editTitle: "Modifier le salon",
    name: "Nom du salon",
    email: "Email",
    mobile: "Téléphone",
    password: "Mot de passe",
    platformFee: "Frais plateforme (%)",
    address: "Adresse",
    landmark: "Repère",
    city: "Ville",
    state: "Région",
    country: "Pays",
    latitude: "Latitude",
    longitude: "Longitude",
    about: "À propos (fiche publique)",
    mainImage: "Photo principale",
    gallery: "Photos du salon (max. 10)",
    nameRequired: "Le nom est requis.",
    aboutRequired: "La description est requise.",
    emailRequired: "L'email est requis.",
    passwordRequired: "Le mot de passe est requis.",
    platformFeeRequired: "Les frais plateforme sont requis.",
    mobileRequired: "Le téléphone est requis.",
    addressRequired: "L'adresse est requise.",
    landmarkRequired: "Le repère est requis.",
    cityRequired: "La ville est requise.",
    stateRequired: "La région est requise.",
    countryRequired: "Le pays est requis.",
    latitudeRequired: "La latitude est requise.",
    longitudeRequired: "La longitude est requise.",
    imagesRequired: "Au moins une photo est requise.",
    imagesMax: "Maximum 10 photos.",
  },
`;
  if (c.includes("\n  coupon: {")) {
    c = c.replace(/\n  coupon: \{/, `\n${block}  coupon: {`);
  } else {
    c = c.replace(/\n  withdraw: \{/, `\n${block}  withdraw: {`);
  }
  fs.writeFileSync(copyPath, c);
  console.log("salonForm injected salon");
}

function injectPortalSalon() {
  const p = path.join(root, "salon", "src", "constants", "skedisyPortalCopy.js");
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes("nameRequired:")) {
    c = c.replace(
      "profileSalonFallback: \"Salon\",",
      `nameRequired: "Le nom est requis.",
  imageRequired: "La photo est requise.",
  oldPasswordRequired: "Le mot de passe actuel est requis.",
  newPasswordRequired: "Le nouveau mot de passe est requis.",
  confirmPasswordRequired: "La confirmation est requise.",
  profileSalonFallback: "Salon",`
    );
    fs.writeFileSync(p, c);
    console.log("portal salon keys");
  }
}

injectTableKeys(path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"));
injectTableKeys(path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"));
injectLabelsKeys(path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"));
injectLabelsKeys(path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"));
injectSalonFormSalon(path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"));
injectPortalSalon();

for (const copyPath of [
  path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"),
]) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (!c.includes("staffAttendance:")) {
    c = c.replace(
      /(monthlyReport: "Rapport mensuel",)/,
      '$1\n    staffAttendance: "Présences équipe",'
    );
    fs.writeFileSync(copyPath, c);
    console.log("pages.staffAttendance frontend");
  }
}

const SETTING_INLINE = [
  ["stripePublishableKey: ` stripePublishableKey Is Required`", "stripePublishableKey: ui.settings.stripePublishableRequired"],
  ["stripeSecretKey: ` Stripe Secret Key Is Required`", "stripeSecretKey: ui.settings.stripeSecretRequired"],
  ["mtnMomoSubscriptionKey: ` MTN MoMo Subscription Key Is Required`", "mtnMomoSubscriptionKey: ui.settings.mtnSubscriptionRequired"],
  ["mtnMomoApiUserId: ` MTN MoMo API User ID Is Required`", "mtnMomoApiUserId: ui.settings.mtnApiUserRequired"],
  ["mtnMomoApiKey: ` MTN MoMo API Key Is Required`", "mtnMomoApiKey: ui.settings.mtnApiKeyRequired"],
  ["razorSecretKey: ` Razorpay Secret Key Is Required`", "razorSecretKey: ui.settings.razorSecretRequired"],
  ["razorPayId: ` razorPay Id Is Required`", "razorPayId: ui.settings.razorIdRequired"],
  ["flutterWaveKey: `FlutterWave Key Is Required`", "flutterWaveKey: ui.settings.flutterWaveRequired"],
  ["privacyPolicyLink: ` privacyPolicyLink Is Required`", "privacyPolicyLink: ui.settings.privacyPolicyRequired"],
  ["tnc: ` Terms And Condition Is Required`", "tnc: ui.settings.tncRequired"],
  ["tax: ` tax Is Required`", "tax: ui.settings.taxRequired"],
  ["cancelOrderCharges: ` Cancel Order Charges Is Required`", "cancelOrderCharges: ui.settings.cancelOrderRequired"],
  ["adminCommissionCharges: ` Admin Commission Is Required`", "adminCommissionCharges: ui.settings.adminCommissionRequired"],
  ["customerCommissionCharges: ` Customer Commission Charge Is Required`", "customerCommissionCharges: ui.settings.customerCommissionRequired"],
  ["salonCommissionCharges: ` Salon Commission Charge Is Required`", "salonCommissionCharges: ui.settings.salonCommissionRequired"],
  ["currencyName: ` currency Name Is Required`", "currencyName: ui.settings.currencyNameRequired"],
  ["currencySymbol: ` Currency Symbol Is Required`", "currencySymbol: ui.settings.currencySymbolRequired"],
  ["razorSecretKey: `WithdrawalRequestedAmount Key Is Required`", "minWithdrawalRequestedAmount: ui.settings.minWithdrawRequired"],
];

const SHARED = [
  ['Title name="Expert earnings"', "Title name={ui.pages.expertEarnings}"],
  ['Title name="Month wise report"', "Title name={ui.pages.monthlyReport}"],
  ['Title name="Staff Attendance"', "Title name={ui.pages.staffAttendance}"],
  ['Title name="Staff attendance"', "Title name={ui.pages.staffAttendance}"],
  ['Title name="Customer"', "Title name={ui.pages.customers}"],
  ['Title name="Expert Withdrawal Request"', "Title name={ui.labels.expertWithdrawRequest}"],
  ['Title name="Attribute"', "Title name={ui.pages.attribute}"],
  ['Title name="Products"', "Title name={ui.pages.products}"],
  ['Title name="Product"', "Title name={ui.pages.product}"],
  ['Title name="Salons"', "Title name={ui.pages.salons}"],
  ['Title name="Orders"', "Title name={ui.pages.orders}"],
  ['Title name="Coupons"', "Title name={ui.pages.coupons}"],
  ['Title name="Reviews"', "Title name={ui.pages.reviews}"],
  ['Title name="Expert Earnings"', "Title name={ui.pages.expertEarnings}"],
  ['<h2 className="text-theme m0">Product Category dialog</h2>', '<h2 className="text-theme m0">{ui.labels.productCategoryDialog}</h2>'],
  ["Header: `Amount (${setting?.currencySymbol})`", "Header: `${col.amount} (${setting?.currencySymbol})`"],
  ["Header: `Amount (${setting.currencySymbol})`", "Header: `${col.amount} (${setting.currencySymbol})`"],
  ["Header: `Price (${setting?.currencySymbol})`", "Header: `${col.price} (${setting?.currencySymbol})`"],
  ["Header: `Price `", "Header: col.price"],
  ["Header: `Admin Commission`", "Header: col.adminCommission"],
  ["Header: `Admin Commission `", "Header: col.adminCommission"],
  ["Header: `Date`", "Header: col.date"],
  ["Header: 'Transaction Type'", "Header: col.transactionType"],
  ["Header: 'Transaction Completed'", "Header: col.transactionCompleted"],
  ["Header: `Salon Earning `", "Header: col.salonEarning"],
  ["Header: `Total Earning `", "Header: col.totalEarning"],
  ["Header: `Final Amount`", "Header: col.finalAmount"],
  ["Header: `Final Amount `", "Header: col.finalAmount"],
  ["Header: `Total (Earnings) `", "Header: col.totalEarning"],
  ["Header: `Salon Commission `", "Header: col.salonCommissionPct"],
  ["Header: `CreatedAt`", "Header: col.createdAt"],
  ['if (!name) error.name = "name is required"', "if (!name) error.name = portalCopy.nameRequired"],
  ['if (!image || imagePath?.length < 0) error.image = "image is required"', "if (!image || imagePath?.length < 0) error.image = portalCopy.imageRequired"],
  ["longitude: `longitude Is Required`", "longitude: portalCopy.longitudeRequired"],
  ['oldPassword: "Old password is required !"', "oldPassword: portalCopy.oldPasswordRequired"],
  ['newPassword: "New password is required !"', "newPassword: portalCopy.newPasswordRequired"],
  ['confirmPassword: "Confirm password is required !"', "confirmPassword: portalCopy.confirmPasswordRequired"],
  ['name: "Name is required !"', "name: portalCopy.nameRequired"],
  ['email: "Email is required !"', "email: portalCopy.emailRequired"],
  ['name: ` Name is required`', "name: ui.dialog.nameRequiredBang"],
  ['errors.name = "Name is required!"', "errors.name = ui.dialog.nameRequiredBang"],
  ['if (!name) validationError.name = "Name is required!"', "if (!name) validationError.name = ui.dialog.nameRequiredBang"],
  ['alt="Product Category"', 'alt={ui.labels.productCategory}'],
];

const ADD_SALON_MAP = [
  ['if (!name) error.name = "Name is required"', "if (!name) error.name = f.nameRequired"],
  ['if (!about) error.about = "About is required"', "if (!about) error.about = f.aboutRequired"],
  ['if (!email) error.email = "Email is required"', "if (!email) error.email = f.emailRequired"],
  ['if (!password) error.password = "Password is required"', "if (!password) error.password = f.passwordRequired"],
  ['if (!platformFee) error.platformFee = "Plat form fee is required"', "if (!platformFee) error.platformFee = f.platformFeeRequired"],
  ['if (!mobile) error.mobile = "Mobile number is required"', "if (!mobile) error.mobile = f.mobileRequired"],
  ['if (!address) error.address = "Address is required"', "if (!address) error.address = f.addressRequired"],
  ['if (!landMark) error.landMark = "Land mark is required"', "if (!landMark) error.landMark = f.landmarkRequired"],
  ['if (!city) error.city = "City is required"', "if (!city) error.city = f.cityRequired"],
  ['if (!states) error.state = "State is required"', "if (!states) error.state = f.stateRequired"],
  ['if (!country) error.country = "Country is required"', "if (!country) error.country = f.countryRequired"],
  ['if (!latitude) error.latitude = "Latitude is required"', "if (!latitude) error.latitude = f.latitudeRequired"],
  ['if (!longitude) error.longitude = "Longitude is required"', "if (!longitude) error.longitude = f.longitudeRequired"],
  ['if (!images) error.images = "Images is required"', "if (!images) error.images = f.imagesRequired"],
  ['if (images?.length === 0) error.images = "Images is required"', "if (images?.length === 0) error.images = f.imagesRequired"],
  ["name: ` Name is required`", "name: f.nameRequired"],
  ["email: `Email is required`", "email: f.emailRequired"],
  ["mobile: `Mobile number is required`", "mobile: f.mobileRequired"],
  ["password: `Password is required`", "password: f.passwordRequired"],
  ["platformFee: `Plat form fee is required`", "platformFee: f.platformFeeRequired"],
  ["address: `Address is required`", "address: f.addressRequired"],
  ["landMark: `Landmark is required`", "landMark: f.landmarkRequired"],
];

function ensureImport(c, key, relFromFile) {
  if (c.includes("skedisyUiCopy") || c.includes("skedisyPortalCopy")) return c;
  const line = `import { ${key} } from "${relFromFile}";\n`;
  const m = c.match(/^import .+;\r?\n/m);
  if (m) {
    const idx = c.indexOf(m[0]) + m[0].length;
    return c.slice(0, idx) + line + c.slice(idx);
  }
  return line + c;
}

function patchAddSalonSalon() {
  const f = path.join(root, "salon", "src", "component", "tables", "salon", "AddSalon.js");
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, "utf8");
  let changed = false;
  if (!c.includes("const f = ui.salonForm")) {
    c = c.replace(
      /import Title from "\.\.\/\.\.\/extras\/Title";\n/,
      'import Title from "../../extras/Title";\nimport { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";\nconst f = ui.salonForm;\n'
    );
    changed = true;
  }
  for (const [from, to] of ADD_SALON_MAP) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(f, c);
    console.log("salon AddSalon.js");
  }
}

function walkComponent(app) {
  const comp = path.join(root, app, "src", "component");
  const key = app === "salon" ? "SKEDISY_SALON_UI" : "SKEDISY_ADMIN_UI";
  const files = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".js")) files.push(p);
    }
  }
  walk(comp);
  for (const f of files) {
    let c = fs.readFileSync(f, "utf8");
    let changed = false;
    const maps = [...SHARED];
    if (norm(f).includes("setting/Setting.js")) maps.push(...SETTING_INLINE);
    for (const [from, to] of maps) {
      if (c.includes(from)) {
        c = c.split(from).join(to);
        changed = true;
      }
    }
    if (!changed) continue;
    const relUi = path
      .relative(path.dirname(f), path.join(root, app, "src", "constants", "skedisyUiCopy.js"))
      .replace(/\\/g, "/")
      .replace(/\.js$/, "");
    if (!c.includes("skedisyUiCopy") && toUsesUi(maps, c)) {
      const line = `import { ${key} as ui } from "${relUi}";\n`;
      const m = c.match(/^import .+;\r?\n/m);
      if (m) {
        const idx = c.indexOf(m[0]) + m[0].length;
        c = c.slice(0, idx) + line + c.slice(idx);
      }
    }
    if (!c.includes("tableHeaders") && c.includes("col.")) {
      const relCol = path
        .relative(path.dirname(f), path.join(root, app, "src", "constants", "tableHeaders.js"))
        .replace(/\\/g, "/")
        .replace(/\.js$/, "");
      if (!c.includes('from "' + relCol + '"') && !c.includes("from '" + relCol + "'")) {
        const line = `import { col } from "${relCol}";\n`;
        const m = c.match(/^import .+;\r?\n/m);
        if (m) {
          const idx = c.indexOf(m[0]) + m[0].length;
          c = c.slice(0, idx) + line + c.slice(idx);
        }
      }
    }
    fs.writeFileSync(f, c);
    console.log(app, path.relative(comp, f));
  }
}

function toUsesUi(maps, c) {
  return c.includes("ui.") || c.includes("{ui.");
}

// AdminProfile frontend — portal only
const adminProfile = path.join(root, "frontend", "src", "component", "pages", "AdminProfile.js");
if (fs.existsSync(adminProfile)) {
  let c = fs.readFileSync(adminProfile, "utf8");
  let ch = false;
  for (const [from, to] of SHARED.filter(([f]) => f.includes("Name is required") || f.includes("Email is required"))) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      ch = true;
    }
  }
  if (ch) {
    fs.writeFileSync(adminProfile, c);
    console.log("frontend AdminProfile.js");
  }
}

patchAddSalonSalon();
walkComponent("salon");
walkComponent("frontend");

// Fix original script path check for next runs
const fix1 = path.join(__dirname, "i18n-rest-fix.js");
let c1 = fs.readFileSync(fix1, "utf8");
if (!c1.includes('norm(f)')) {
  c1 = c1.replace(
    'if (f.includes("setting/Setting.js")) maps.push(...SETTING_INLINE);',
    'if (norm(f).includes("setting/Setting.js")) maps.push(...SETTING_INLINE);'
  );
  if (!c1.includes("function norm")) {
    c1 = c1.replace(
      "const root = path.join(__dirname, \"..\");",
      'const root = path.join(__dirname, "..");\nfunction norm(p) { return p.replace(/\\\\/g, "/"); }'
    );
  }
  fs.writeFileSync(fix1, c1);
  console.log("i18n-rest-fix.js path fix");
}

console.log("v2 done");
