const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const SALON_SETTING_MAP = [
  ['error.privacyPolicyLink = "Privacy Policy Link is required"', "error.privacyPolicyLink = ui.settings.privacyPolicyRequired"],
  ['error.tnc = "T&C is required"', "error.tnc = ui.settings.tncRequired"],
  ['error.stripePublishableKey = "Stripe Publishable Key is required"', "error.stripePublishableKey = ui.settings.stripePublishableRequired"],
  ['error.stripeSecretKey = "Stripe Secret Key is required"', "error.stripeSecretKey = ui.settings.stripeSecretRequired"],
  ['error.razorPayId = "Razor Pay Id is required"', "error.razorPayId = ui.settings.razorIdRequired"],
  ['error.razorSecretKey = "Razor Secret Key is required"', "error.razorSecretKey = ui.settings.razorSecretRequired"],
  ['error.tax = "Tax is required"', "error.tax = ui.settings.taxRequired"],
  ['error.currencyName = "Currency Name is required"', "error.currencyName = ui.settings.currencyNameRequired"],
  ['error.currencySymbol = "Currency Symbol is required"', "error.currencySymbol = ui.settings.currencySymbolRequired"],
  ['error.flutterWaveKey = "Flutter Wave Key is required"', "error.flutterWaveKey = ui.settings.flutterWaveRequired"],
  ['error.firebaseKey = "Firebase Key is required"', "error.firebaseKey = ui.settings.firebaseRequired"],
  ['error.commissionPerProductQuantity = "commissionPerProductQuantity Key is required"', "error.commissionPerProductQuantity = ui.settings.adminCommissionRequired"],
  ['error.cancelOrderCharges = "cancelOrderCharges Key is required"', "error.cancelOrderCharges = ui.settings.cancelOrderRequired"],
  ['error.minWithdrawalRequestedAmount = "withDrawReq is required"', "error.minWithdrawalRequestedAmount = ui.settings.minWithdrawRequired"],
  ['placeholder="Enter Stripe Publishable Key"', "placeholder={ui.settings.stripePublishablePh}"],
  ['placeholder="Enter Stripe Secret Key"', "placeholder={ui.settings.stripeSecretPh}"],
  ['placeholder="Enter Razorpay Secret Key"', "placeholder={ui.settings.razorSecretPh}"],
  ['placeholder="Enter razorPay Id"', "placeholder={ui.settings.razorIdPh}"],
  ['placeholder="EnterFlutterWave Key"', "placeholder={ui.settings.flutterWavePh}"],
  ['placeholder="Enter privacyPolicyLink"', "placeholder={ui.settings.privacyPolicyPh}"],
  ['placeholder="Enter tnc"', "placeholder={ui.settings.tncPh}"],
  ['placeholder="Enter tax"', "placeholder={ui.settings.taxPh}"],
  ['placeholder="Enter Cancel Order Charges"', "placeholder={ui.settings.cancelOrderPh}"],
  ['placeholder="Enter Admin Commission"', "placeholder={ui.settings.adminCommissionPh}"],
  ['placeholder="Enter currency Name"', "placeholder={ui.settings.currencyNamePh}"],
  ['placeholder="Enter Currency Symbol"', "placeholder={ui.settings.currencySymbolPh}"],
  ['placeholder="Enter minWithdrawalRequestedAmount"', "placeholder={ui.settings.minWithdrawPh}"],
  ["Stripe pay active (enable/disable stripe pay)", "{ui.settings.stripeActive}"],
  ["Razor pay active (enable/disable razor pay)", "{ui.settings.razorActive}"],
  ["Razor pay active", "{ui.settings.razorActive}"],
  ["flutterwave payment (enable/disable)", "{ui.settings.flutterActive}"],
  ["Maintenance Mode", "{ui.settings.maintenanceMode}"],
  ["New product request enable/disable for seller", "{ui.settings.productRequestNew}"],
  ["Enable/disable product request update for seller", "{ui.settings.productRequestUpdate}"],
];

const ADMIN_SETTING_EXTRA = [
  ['error.commissionPerProductQuantity = "Admin Commission (for products) is required"', "error.commissionPerProductQuantity = ui.settings.adminCommissionRequired"],
  ['error.customerCommissionCharges = "Customer Commission Charge is required"', "error.customerCommissionCharges = ui.settings.customerCommissionRequired"],
  ['error.salonCommissionCharges = "Salon Commission Charge is required"', "error.salonCommissionCharges = ui.settings.salonCommissionRequired"],
  ['error.minWithdrawalRequestedAmount = "withDrawReq is required"', "error.minWithdrawalRequestedAmount = ui.settings.minWithdrawRequired"],
  ['placeholder="Enter MTN MoMo Subscription Key (Primary or Secondary from subscription)"', "placeholder={ui.settings.mtnSubscriptionPh}"],
  ['placeholder="Enter MTN MoMo API User ID (UUID format)"', "placeholder={ui.settings.mtnApiUserPh}"],
  ['placeholder="Enter MTN MoMo API Key"', "placeholder={ui.settings.mtnApiKeyPh}"],
  ['placeholder="Enter callback host (e.g., skedisy.com or api.skedisy.com)"', "placeholder={ui.settings.mtnCallbackPh}"],
  ['placeholder="Enter Admin Commission for Products"', "placeholder={ui.settings.adminCommissionPh}"],
  ['placeholder="Enter Customer Commission Charge"', "placeholder={ui.settings.customerCommissionPh}"],
  ['placeholder="Enter Salon Commission Charge"', "placeholder={ui.settings.salonCommissionPh}"],
  ['placeholder="Enter Minimum Salon Wallet Balance"', "placeholder={ui.settings.minWalletPh}"],
];

function ensureImport(c, app, relFromConstants) {
  if (c.includes("skedisyUiCopy")) return c;
  const exportName = app === "salon" ? "SKEDISY_SALON_UI" : "SKEDISY_ADMIN_UI";
  const line = `import { ${exportName} as ui } from "${relFromConstants}";\n`;
  const idx = c.indexOf("\n", c.indexOf("import "));
  if (idx > 0) return c.slice(0, idx + 1) + line + c.slice(idx + 1);
  return line + c;
}

function applyMap(filePath, app, map, importRel) {
  let c = fs.readFileSync(filePath, "utf8");
  c = ensureImport(c, app, importRel);
  let n = 0;
  for (const [from, to] of map) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      n++;
    }
  }
  fs.writeFileSync(filePath, c);
  console.log(path.relative(root, filePath), n);
}

function patchAppointment(filePath, app, importRel) {
  let c = fs.readFileSync(filePath, "utf8");
  c = ensureImport(c, app, importRel);
  const a = "ui.appointment";
  const reps = [
    ["New Appointment", "{ui.appointment.title}"],
    ['<span className=" fw-bold">On {new Date().toDateString()}</span>', '<span className=" fw-bold">{ui.appointment.onDatePrefix} {new Date().toLocaleDateString("fr-FR")}</span>'],
    ['<span className="">At --:--</span>', '<span className="">{ui.appointment.atTime} --:--</span>'],
    ["Salon\n                </label>", "{ui.appointment.salon}\n                </label>"],
    ["Expert\n                </label>", "{ui.appointment.expert}\n                </label>"],
    ["Customer\n                    </label>", "{ui.appointment.customer}\n                    </label>"],
    ["--select Salon--", "{ui.appointment.selectSalon}"],
    ["--select Expert--", "{ui.appointment.selectExpert}"],
    ["--select User--", "{ui.appointment.selectCustomer}"],
    ['salon: "salon is Required !"', "salon: ui.appointment.salonRequired"],
    ['expert: "expert is Required !"', "expert: ui.appointment.expertRequired"],
    ['user: "user is Required !"', "user: ui.appointment.customerRequired"],
    ["Choose Start Date", "{ui.appointment.chooseDate}"],
    ["Choose Start Time", "{ui.appointment.chooseTime}"],
    ['Client since{" "}', "{ui.appointment.clientSince}{\" \"}"],
    ["<span>Email </span>", "<span>{ui.appointment.email} </span>"],
    ["<span> UniqueId</span>", "<span> {ui.appointment.uniqueId}</span>"],
    ['aria-label="Close"', 'aria-label={ui.appointment.close}'],
  ];
  for (const [from, to] of reps) {
    if (c.includes(from)) c = c.split(from).join(to);
  }
  fs.writeFileSync(filePath, c);
  console.log("appointment", path.relative(root, filePath));
}

// Settings
applyMap(
  path.join(root, "salon/src/component/tables/setting/Setting.js"),
  "salon",
  SALON_SETTING_MAP,
  "../../../constants/skedisyUiCopy"
);
applyMap(
  path.join(root, "frontend/src/component/tables/setting/Setting.js"),
  "frontend",
  [...SALON_SETTING_MAP, ...ADMIN_SETTING_EXTRA],
  "../../../constants/skedisyUiCopy"
);

// Appointments
for (const app of ["salon", "frontend"]) {
  patchAppointment(
    path.join(root, app, "src/component/tables/appointment/AppointMentDialogue.js"),
    app,
    "../../../constants/skedisyUiCopy"
  );
}

// Withdrawal placeholders
for (const rel of [
  "salon/src/component/tables/WithDrawal/PendingRequest.js",
  "salon/src/component/tables/WithDrawal/PendingSalonReq.js",
  "frontend/src/component/tables/WithDrawal/PendingSalonReq.js",
  "frontend/src/component/tables/WithDrawal/PendingRequest.js",
]) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) continue;
  let c = fs.readFileSync(p, "utf8");
  const app = rel.startsWith("salon") ? "salon" : "frontend";
  c = ensureImport(c, app, "../../../constants/skedisyUiCopy");
  c = c.replace(
    "placeholder={`Enter your ${label.toLowerCase()}`}",
    "placeholder={`${ui.common.enterYour} ${label.toLowerCase()}`}"
  );
  fs.writeFileSync(p, c);
  console.log("withdraw ph", rel);
}

// NotificationDialog
for (const rel of [
  "salon/src/component/tables/User/NotificationDialog.js",
  "frontend/src/component/tables/User/NotificationDialog.js",
]) {
  const p = path.join(root, rel);
  let c = fs.readFileSync(p, "utf8");
  const app = rel.startsWith("salon") ? "salon" : "frontend";
  if (!c.includes("skedisyUiCopy")) {
    c = ensureImport(c, app, "../../../constants/skedisyUiCopy");
  }
  c = c
    .replace(/error\.title = "Title is Required"/g, "error.title = ui.dialog.titleRequired")
    .replace(/error\.message = "Message is Required"/g, "error.message = ui.dialog.messageRequired");
  fs.writeFileSync(p, c);
  console.log("notif", rel);
}

// ExpertDialogue residual backticks
for (const rel of [
  "salon/src/component/tables/expert/ExpertDialogue.js",
  "frontend/src/component/tables/expert/ExpertDialogue.js",
]) {
  const p = path.join(root, rel);
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(/`Email is Required`/g, "ui.dialog.emailRequired");
  c = c.replace(/`age is Required`/g, "ui.dialog.ageRequired");
  c = c.replace(/`Commission is Required`/g, "ui.dialog.commissionRequired");
  c = c.replace(/`Password is Required`/g, "ui.dialog.passwordRequired");
  c = c.replace(/`First Name is required`/g, "ui.dialog.firstNameRequired");
  fs.writeFileSync(p, c);
  console.log("expert fix", rel);
}

console.log("done");
