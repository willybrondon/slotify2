/**
 * Sync public/salon-claim.html → lib/salonOnboardingHtml.js (fallback when disk file missing).
 * Usage: node scripts/sync-salon-onboarding-html.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "public", "salon-claim.html");
const outPath = path.join(root, "lib", "salonOnboardingHtml.js");

const html = fs.readFileSync(htmlPath, "utf8");
if (!html.includes('id="registerMode"') || !html.includes('id="marketingMode"')) {
  console.error("salon-claim.html missing registerMode or marketingMode");
  process.exit(1);
}

const banner =
  "/** Auto-synced onboarding page for /salon/claim and /salon/rejoindre */\n";
fs.writeFileSync(outPath, banner + "module.exports = " + JSON.stringify(html) + ";\n");
console.log("Synced", html.length, "chars →", path.relative(root, outPath));
