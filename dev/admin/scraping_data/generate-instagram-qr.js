/**
 * Génère un QR code Instagram Skedisy avec logo centré.
 * Usage: node generate-instagram-qr.js
 */
const path = require("path");
const fs = require("fs");

const INSTAGRAM_URL = "https://www.instagram.com/skedisy/";
const OUT_DIR = path.join(__dirname, "assets");
const LOGO_PATH = path.join(OUT_DIR, "skedisy-logo.png");
const OUT_PNG = path.join(OUT_DIR, "qr-instagram-skedisy.png");
const OUT_SVG = path.join(OUT_DIR, "qr-instagram-skedisy.svg");

async function main() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.error("Logo introuvable:", LOGO_PATH);
    process.exit(1);
  }

  const { QRCodeStyling } = require("qr-code-styling/lib/qr-code-styling.common.js");
  const nodeCanvas = require("canvas");
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM("");

  const options = {
    jsdom: JSDOM,
    nodeCanvas,
    width: 1200,
    height: 1200,
    margin: 24,
    data: INSTAGRAM_URL,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { color: "#111111", type: "rounded" },
    cornersSquareOptions: { color: "#111111", type: "extra-rounded" },
    cornersDotOptions: { color: "#111111", type: "dot" },
    backgroundOptions: { color: "#ffffff" },
    image: LOGO_PATH,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.32,
      margin: 12,
      crossOrigin: "anonymous",
    },
  };

  const qr = new QRCodeStyling(options);

  const pngBuffer = await qr.getRawData("png");
  fs.writeFileSync(OUT_PNG, pngBuffer);

  const svgBuffer = await qr.getRawData("svg");
  fs.writeFileSync(OUT_SVG, svgBuffer);

  console.log("✅ QR Instagram Skedisy généré:");
  console.log("   PNG:", OUT_PNG);
  console.log("   SVG:", OUT_SVG);
  console.log("   URL:", INSTAGRAM_URL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
