/**
 * Vague 4 : placeholders, labels formulaires, Redux toasts EN restants.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const FORM_BLOCK = `
  form: {
    productCode: "Code produit (6 chiffres)",
    productName: "Nom du produit",
    description: "Description",
    brand: "Marque",
    price: "Prix",
    mrp: "Prix public (MRP)",
    shippingCharges: "Frais de livraison",
    mainImage: "Photo principale",
    serviceName: "Nom de la prestation",
    serviceCharge: "Tarif prestation",
    serviceDuration: "Durée (min)",
    mobileNumber: "Téléphone",
    email: "Email",
    age: "Âge",
    adminCommissionPct: "Commission plateforme (%)",
    salonCommissionPct: "Commission salon (%)",
    bankName: "Nom de la banque",
    accountNumber: "N° de compte",
    branchName: "Agence",
    branchNameTypo: "Agence",
    ifscCode: "Code banque (IFSC)",
    upiId: "Identifiant UPI",
    password: "Mot de passe",
    male: "Homme",
    female: "Femme",
    image: "Photo",
    firstName: "Prénom",
    lastName: "Nom",
    uniqueId: "Référence",
    gender: "Genre",
    emailId: "Email",
    loginType: "Mode de connexion",
    salonName: "Nom du salon",
    platformFeePct: "Frais plateforme (%)",
    platformFeeTypo: "Frais plateforme (%)",
    shareLink: "Lien de partage",
    latitude: "Latitude",
    longitude: "Longitude",
    address: "Adresse",
    landmark: "Repère",
    landMark: "Repère",
    city: "Ville",
    state: "Région",
    country: "Pays",
    date: "Date",
    time: "Heure",
    checkOutTime: "Heure de fin",
    title: "Titre",
    message: "Message",
    details: "Détail",
    reportDateTime: "Date et heure du signalement",
    solvedDateTime: "Date et heure de résolution",
    expertCount: "Nombre de pros",
    mobile: "Téléphone",
    day: "Jour",
    slotTimeMinute: "Créneau (minutes)",
    deliveredServiceName: "Prestation réalisée",
    trackingId: "N° de suivi",
    trackingLink: "Lien de suivi",
    subTotal: "Sous-total",
    wallet: "Portefeuille",
    name: "Nom",
    about: "À propos",
  },
`;

function injectForm(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (c.includes("form: {")) return;
  c = c.replace(/\n  bonusPenalty: \{/, `\n${FORM_BLOCK}  bonusPenalty: {`);
  fs.writeFileSync(copyPath, c);
  console.log("form block", path.basename(copyPath));
}

function injectFrontendToasts(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  const adds = [];
  if (!c.includes("taxAdded:")) adds.push('    taxAdded: "Taxe ajoutée.",');
  if (!c.includes("taxUpdated:")) adds.push('    taxUpdated: "Taxe mise à jour.",');
  if (!c.includes("taxStatus:")) adds.push('    taxStatus: "Statut taxe mis à jour.",');
  if (!c.includes("taxGeneric:")) adds.push('    taxGeneric: "Taxe mise à jour.",');
  if (!c.includes("passwordUpdated:")) adds.push('    passwordUpdated: "Mot de passe mis à jour.",');
  if (!adds.length) return;
  c = c.replace(/(loginOk: "[^"]+",)/, `$1\n${adds.join("\n")}`);
  fs.writeFileSync(copyPath, c);
  console.log("frontend toast keys");
}

injectForm(path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"));
injectForm(path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"));
injectFrontendToasts(path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"));

const LABEL_PH = [
  ["label={`Product Code (6 digit)`}", "label={ui.form.productCode}"],
  ["label={`Product Name`}", "label={ui.form.productName}"],
  ["label={`Product name`}", "label={ui.form.productName}"],
  ["label={`Description`}", "label={ui.form.description}"],
  ["label={`Brand`}", "label={ui.form.brand}"],
  ["label={`Price`}", "label={ui.form.price}"],
  ["label={`Mrp`}", "label={ui.form.mrp}"],
  ["label={`MRP`}", "label={ui.form.mrp}"],
  ["label={`Shipping Charges`}", "label={ui.form.shippingCharges}"],
  ["label={`Main Image`}", "label={ui.form.mainImage}"],
  ["placeholder={`Product name`}", "placeholder={ui.form.productName}"],
  ["placeholder={`Description`}", "placeholder={ui.form.description}"],
  ["placeholder={`brand`}", "placeholder={ui.form.brand}"],
  ["placeholder={`Price`}", "placeholder={ui.form.price}"],
  ["placeholder={`MRP`}", "placeholder={ui.form.mrp}"],
  ["placeholder={`Shipping Charges`}", "placeholder={ui.form.shippingCharges}"],
  ["label={`Service name`}", "label={ui.form.serviceName}"],
  ["label={`Service charge`}", "label={ui.form.serviceCharge}"],
  ["label={`Service duration`}", "label={ui.form.serviceDuration}"],
  ["placeholder={`Service name`}", "placeholder={ui.form.serviceName}"],
  ["placeholder={`Service charge`}", "placeholder={ui.form.serviceCharge}"],
  ["placeholder={`Service duration`}", "placeholder={ui.form.serviceDuration}"],
  ["label={`Mobile number`}", "label={ui.form.mobileNumber}"],
  ["placeholder={`Mobile number`}", "placeholder={ui.form.mobileNumber}"],
  ["label={`Email`}", "label={ui.form.email}"],
  ["placeholder={`Email`}", "placeholder={ui.form.email}"],
  ["label={`Age`}", "label={ui.form.age}"],
  ["placeholder={`Age`}", "placeholder={ui.form.age}"],
  ["label={`Admin Commission (%)`}", "label={ui.form.adminCommissionPct}"],
  ["label={`Admin Commission`}", "label={ui.form.adminCommissionPct}"],
  ["placeholder={`Admin Commission`}", "placeholder={ui.form.adminCommissionPct}"],
  ["label={`Salon commission (%)`}", "label={ui.form.salonCommissionPct}"],
  ["label={`Bank Name`}", "label={ui.form.bankName}"],
  ["label={`Account Number`}", "label={ui.form.accountNumber}"],
  ["label={`Branch Name)`}", "label={ui.form.branchNameTypo}"],
  ["label={`Branch Name`}", "label={ui.form.branchName}"],
  ["label={`IFSC Code`}", "label={ui.form.ifscCode}"],
  ["label={`Upi Id`}", "label={ui.form.upiId}"],
  ["label={`Password`}", "label={ui.form.password}"],
  ["placeholder={`Password`}", "placeholder={ui.form.password}"],
  ["placeholder={`Bank Name`}", "placeholder={ui.form.bankName}"],
  ["placeholder={`Account Number`}", "placeholder={ui.form.accountNumber}"],
  ["placeholder={`Branch Name`}", "placeholder={ui.form.branchName}"],
  ["placeholder={`IFSC Code`}", "placeholder={ui.form.ifscCode}"],
  ["placeholder={`Upi Id`}", "placeholder={ui.form.upiId}"],
  ["label={`Male`}", "label={ui.form.male}"],
  ["label={`Female`}", "label={ui.form.female}"],
  ["label={`Image`}", "label={ui.form.image}"],
  ["label={`First name`}", "label={ui.form.firstName}"],
  ["label={`Last name`}", "label={ui.form.lastName}"],
  ["label={`Unique id`}", "label={ui.form.uniqueId}"],
  ["label={`Gender`}", "label={ui.form.gender}"],
  ["label={`Email id`}", "label={ui.form.emailId}"],
  ["label={`Login type`}", "label={ui.form.loginType}"],
  ["label={`Salon name`}", "label={ui.form.salonName}"],
  ["label={`Salon Name`}", "label={ui.form.salonName}"],
  ["label={`Plateform fee (%)`}", "label={ui.form.platformFeePct}"],
  ["label={`Plateform Fees (%)`}", "label={ui.form.platformFeePct}"],
  ["placeholder={`salonName`}", "placeholder={ui.form.salonName}"],
  ["placeholder={`email`}", "placeholder={ui.form.email}"],
  ["placeholder={`Plat form Fee`}", "placeholder={ui.form.platformFeeTypo}"],
  ["placeholder={`mobileNumber`}", "placeholder={ui.form.mobileNumber}"],
  ["placeholder={`city`}", "placeholder={ui.form.city}"],
  ["placeholder={`Share Link`}", "placeholder={ui.form.shareLink}"],
  ["placeholder={`latitude`}", "placeholder={ui.form.latitude}"],
  ["placeholder={`longitude`}", "placeholder={ui.form.longitude}"],
  ["placeholder={`address`}", "placeholder={ui.form.address}"],
  ["placeholder={`landmark`}", "placeholder={ui.form.landmark}"],
  ["placeholder={`state`}", "placeholder={ui.form.state}"],
  ["placeholder={`country`}", "placeholder={ui.form.country}"],
  ["label={`Share Link`}", "label={ui.form.shareLink}"],
  ["label={`Latitude`}", "label={ui.form.latitude}"],
  ["label={`Longitude`}", "label={ui.form.longitude}"],
  ["label={`Address`}", "label={ui.form.address}"],
  ["label={`LandMark`}", "label={ui.form.landMark}"],
  ["label={`City`}", "label={ui.form.city}"],
  ["label={`State`}", "label={ui.form.state}"],
  ["label={`Country`}", "label={ui.form.country}"],
  ["label={`Date`}", "label={ui.form.date}"],
  ["label={`Time`}", "label={ui.form.time}"],
  ["placeholder={`Time`}", "placeholder={ui.form.time}"],
  ["label={`Check out time`}", "label={ui.form.checkOutTime}"],
  ["label={`Title`}", "label={ui.form.title}"],
  ["label={`Message`}", "label={ui.form.message}"],
  ["placeholder={`Title`}", "placeholder={ui.form.title}"],
  ["placeholder={`Message`}", "placeholder={ui.form.message}"],
  ["label={`Details`}", "label={ui.form.details}"],
  ["placeholder={`Details`}", "placeholder={ui.form.details}"],
  ["label={`Date and time of report`}", "label={ui.form.reportDateTime}"],
  ["label={`Date And Time Of Report`}", "label={ui.form.reportDateTime}"],
  ["label={`Solved date and time `}", "label={ui.form.solvedDateTime}"],
  ["label={`Solved Date And Time `}", "label={ui.form.solvedDateTime}"],
  ["placeholder={`Date & Time`}", "placeholder={ui.form.reportDateTime}"],
  ["label={`Expert count`}", "label={ui.form.expertCount}"],
  ["label={`Mobile`}", "label={ui.form.mobile}"],
  ["label={`Day`}", "label={ui.form.day}"],
  ["label={`Slot Time (Minute)`}", "label={ui.form.slotTimeMinute}"],
  ["placeholder={`Day`}", "placeholder={ui.form.day}"],
  ["placeholder={`slotTime`}", "placeholder={ui.form.slotTimeMinute}"],
  ['placeholder={"Delivered service name"}', "placeholder={ui.form.deliveredServiceName}"],
  ['placeholder={"Tracking Id"}', "placeholder={ui.form.trackingId}"],
  ['placeholder={"Tracking Link"}', "placeholder={ui.form.trackingLink}"],
  ['placeholder={"SubTotal"}', "placeholder={ui.form.subTotal}"],
  ['placeholder="Wallet"', "placeholder={ui.form.wallet}"],
  ["label={`Name`}", "label={ui.form.name}"],
  ["placeholder={`Name`}", "placeholder={ui.form.name}"],
  ["label={`Old Password`}", "label={portalCopy.oldPassword}"],
  ["label={`New Password`}", "label={portalCopy.newPassword}"],
  ["label={`Confirm Password`}", "label={portalCopy.confirmPasswordField}"],
];

const REDUX_MAP = [
  ['Success("Admin Create Successfully")', "Success(ui.toast.adminCreated)"],
  ['Success("Code Update Successfully")', "Success(ui.toast.codeUpdated)"],
  ['Success("Admin Updated Successfully")', "Success(ui.toast.adminUpdated)"],
  ['Success("Tax Added Successfully")', "Success(ui.toast.taxAdded)"],
  ['Success("Tax Updated Successfully")', "Success(ui.toast.taxUpdated)"],
  ['Success("Tax Status Updated Successfully")', "Success(ui.toast.taxStatus)"],
  ['Success("Tax  Successfully")', "Success(ui.toast.taxGeneric)"],
];

function ensureUiImport(c, filePath, app) {
  const key = app === "salon" ? "SKEDISY_SALON_UI" : "SKEDISY_ADMIN_UI";
  if (c.includes("skedisyUiCopy")) return c;
  const rel = path
    .relative(path.dirname(filePath), path.join(root, app, "src", "constants", "skedisyUiCopy.js"))
    .replace(/\\/g, "/")
    .replace(/\.js$/, "");
  const line = `import { ${key} as ui } from "${rel}";\n`;
  const m = c.match(/^import .+;\r?\n/m);
  if (m) {
    const idx = c.indexOf(m[0]) + m[0].length;
    return c.slice(0, idx) + line + c.slice(idx);
  }
  return line + c;
}

function ensurePortalImport(c, filePath, app) {
  if (!c.includes("portalCopy.")) return c;
  if (c.includes("skedisyPortalCopy")) return c;
  const key = app === "salon" ? "SKEDISY_SALON_PORTAL_COPY" : "SKEDISY_ADMIN_PORTAL_COPY";
  const rel = path
    .relative(path.dirname(filePath), path.join(root, app, "src", "constants", "skedisyPortalCopy.js"))
    .replace(/\\/g, "/")
    .replace(/\.js$/, "");
  const line = `import { ${key} as portalCopy } from "${rel}";\n`;
  const m = c.match(/^import .+;\r?\n/m);
  if (m) {
    const idx = c.indexOf(m[0]) + m[0].length;
    return c.slice(0, idx) + line + c.slice(idx);
  }
  return line + c;
}

function patchFile(f, app, maps) {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, "utf8");
  let changed = false;
  for (const [from, to] of maps) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      changed = true;
    }
  }
  if (!changed) return;
  if (c.includes("ui.form")) c = ensureUiImport(c, f, app);
  if (c.includes("portalCopy.")) c = ensurePortalImport(c, f, app);
  fs.writeFileSync(f, c);
  console.log(app, path.relative(path.join(root, app, "src"), f));
}

function walkComponent(app) {
  const comp = path.join(root, app, "src", "component");
  const files = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".js")) files.push(p);
    }
  }
  walk(comp);
  for (const f of files) patchFile(f, app, LABEL_PH);
}

walkComponent("salon");
walkComponent("frontend");

// Redux frontend
const taxSlice = path.join(root, "frontend", "src", "redux", "slice", "taxSlice.js");
let tax = fs.readFileSync(taxSlice, "utf8");
if (!tax.includes("skedisyUiCopy")) {
  tax = tax.replace(
    /import \{ Success, DangerRight \} from[^\n]+\n/,
    '$&import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";\n'
  );
}
for (const [from, to] of REDUX_MAP) tax = tax.split(from).join(to);
fs.writeFileSync(taxSlice, tax);
console.log("frontend taxSlice.js");

const authSlice = path.join(root, "frontend", "src", "redux", "slice", "authSlice.js");
let auth = fs.readFileSync(authSlice, "utf8");
for (const [from, to] of REDUX_MAP) auth = auth.split(from).join(to);
if (auth.includes('Success(ui.toast.adminUpdated)') && auth.includes("updateAdminPassword.fulfilled")) {
  auth = auth.replace(
    /updateAdminPassword\.fulfilled[\s\S]*?Success\(ui\.toast\.adminUpdated\)/,
    (m) => m.replace("Success(ui.toast.adminUpdated)", "Success(ui.toast.passwordUpdated)")
  );
}
fs.writeFileSync(authSlice, auth);
console.log("frontend authSlice.js");

// Salon AddSalon labels (salonForm)
const addSalonSalon = path.join(root, "salon", "src", "component", "tables", "salon", "AddSalon.js");
if (fs.existsSync(addSalonSalon)) {
  let c = fs.readFileSync(addSalonSalon, "utf8");
  const SALON_MAP = [
    ["label={`Name`}", "label={f.name}"],
    ["placeholder={`Name`}", "placeholder={f.name}"],
    ["label={`email`}", "label={f.email}"],
    ["placeholder={`email`}", "placeholder={f.email}"],
    ["label={`Mobile number`}", "label={f.mobile}"],
    ["placeholder={`Mobile number`}", "placeholder={f.mobile}"],
    ["label={`Password`}", "label={f.password}"],
    ["placeholder={`Password`}", "placeholder={f.password}"],
    ["label={`Platform fee (%)`}", "label={f.platformFee}"],
    ["placeholder={`Platform Fee`}", "placeholder={f.platformFee}"],
    ["label={`Address`}", "label={f.address}"],
    ["placeholder={`Address`}", "placeholder={f.address}"],
    ["label={`Landmark`}", "label={f.landmark}"],
    ["placeholder={`Landmark`}", "placeholder={f.landmark}"],
    ["label={`City`}", "label={f.city}"],
    ["placeholder={`City`}", "placeholder={f.city}"],
    ["label={`State`}", "label={f.state}"],
    ["placeholder={`State`}", "placeholder={f.state}"],
    ["label={`Country`}", "label={f.country}"],
    ["placeholder={`Country`}", "placeholder={f.country}"],
    ["label={`latitude`}", "label={f.latitude}"],
    ["placeholder={`latitude`}", "placeholder={f.latitude}"],
    ["label={`longitude`}", "label={f.longitude}"],
    ["placeholder={`longitude`}", "placeholder={f.longitude}"],
    ["label={`About`}", "label={f.about}"],
    ["placeholder={`about`}", "placeholder={f.about}"],
    ["label={`Main Image`}", "label={f.mainImage}"],
  ];
  let ch = false;
  for (const [from, to] of SALON_MAP) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      ch = true;
    }
  }
  if (ch) {
    fs.writeFileSync(addSalonSalon, c);
    console.log("salon AddSalon labels");
  }
}

// Admin AddSalon platform fee placeholder
const addSalonAdmin = path.join(root, "frontend", "src", "component", "tables", "salon", "AddSalon.js");
patchFile(addSalonAdmin, "frontend", [["placeholder={`Platform Fee`}", "placeholder={f.platformFee}"]]);

console.log("vague4 done");
