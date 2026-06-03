const fs = require("fs");
const path = require("path");

const files = [
  ["frontend", "frontend/src/component/tables/setting/Setting.js"],
  ["salon", "salon/src/component/tables/setting/Setting.js"],
];

const root = path.join(__dirname, "..");
const MAP = [
  ["STRIPE PAY SETTING", "{ui.settings.stripeSection}"],
  ["MTN MOMO SETTING", "{ui.settings.mtnSection}"],
  ["RAZOR PAY SETTING", "{ui.settings.razorSection}"],
  ["FLUTTER WAVE SETTING", "{ui.settings.flutterSection}"],
  ["APP SETTING", "{ui.settings.appSection}"],
  ["Add Product Request", "{ui.settings.addProductRequest}"],
  ["Update  Product Request", "{ui.settings.updateProductRequest}"],
  ["Update Product Request", "{ui.settings.updateProductRequest}"],
  ['onClick={() => setType("setting")}', 'onClick={() => setType("setting")}'], // keep
];

const LABEL_MAP = [
  [">Setting<", ">{ui.settings.tabSettings}<"],
  [">Payment Setting<", ">{ui.settings.tabPayments}<"],
  [">Withdraw<", ">{ui.settings.tabWithdraw}<"],
  ["MTN MoMo active (enable/disable MTN MoMo)", "{ui.settings.mtnActive}"],
  ["⚠️ <strong>Important:</strong> Make sure to enable this toggle switch after adding all MTN MoMo keys above.", "{ui.settings.mtnEnableHint}"],
  ["<strong>Note:</strong> The Subscription Key for <code>Ocp-Apim-Subscription-Key</code> header will use API Key if provided, otherwise Primary Key.", "{ui.settings.mtnSubKeyHint}"],
  ['<option value="sandbox">Sandbox</option>', '<option value="sandbox">{ui.settings.mtnEnvSandbox}</option>'],
  ['<option value="production">Production</option>', '<option value="production">{ui.settings.mtnEnvProduction}</option>'],
  [">✓ Enabled</span>", ">{ui.settings.mtnEnabled}</span>"],
  [">✗ Disabled</span>", ">{ui.settings.mtnDisabled}</span>"],
  ["Admin Commission Charges (%)", "{ui.settings.adminCommissionLabel}"],
  ["firebaseKey: \"Invalid JSON input\"", "firebaseKey: ui.settings.invalidJson"],
];

// salon-only simpler labels
const SALON_EXTRA = [
  ["Admin Commission Charges (%)", "{ui.settings.adminCommissionLabel}"],
];

for (const [app, rel] of files) {
  const p = path.join(root, rel);
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes("skedisyUiCopy") && app === "salon") {
    // already has import from col line
    if (!c.includes("SKEDISY_SALON_UI")) {
      c = c.replace(
        /import { col }[^\n]+\n/,
        (m) => m + 'import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";\n'
      );
    }
  }
  const maps = app === "frontend" ? [...MAP, ...LABEL_MAP] : SALON_EXTRA;
  for (const [from, to] of maps) {
    if (c.includes(from)) c = c.split(from).join(to);
  }
  // frontend tab buttons - grep actual text
  if (app === "frontend") {
    const tabs = [
      ["Setting", "ui.settings.tabSettings"],
      ["Payment Setting", "ui.settings.tabPayments"],
      ["Withdraw", "ui.settings.tabWithdraw"],
    ];
    for (const [en, key] of tabs) {
      c = c.replace(new RegExp(`>\\s*${en}\\s*<`, "g"), `>{${key}}<`);
    }
  }
  fs.writeFileSync(p, c);
  console.log("ok", rel);
}

// extend salon settings with tab keys if missing - copy from admin structure minimal
const salonCopy = path.join(root, "salon", "src", "constants", "skedisyUiCopy.js");
let sc = fs.readFileSync(salonCopy, "utf8");
if (!sc.includes("adminCommissionLabel")) {
  sc = sc.replace(
    "generalSettings: \"Paramètres généraux\",",
    `generalSettings: "Paramètres généraux",
    adminCommissionLabel: "Commission admin produits (%)",
    invalidJson: "JSON invalide.",`
  );
  fs.writeFileSync(salonCopy, sc);
}

console.log("done");
