const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const MAP = [
  ["Header: `Booking Id`", "Header: col.bookingId"],
  ["Header: `Expert Earnings `", "Header: col.expertEarning"],
  ["Header: `Tax `", "Header: col.tax"],
  ["Header: `Settlement Date`", "Header: col.settlementDate"],
  ["Header: `Bonus/Penalty `", "Header: col.bonusPenalty"],
  [
    "Header: `Minimum Amount To Apply (${setting?.currencySymbol})`",
    "Header: `${ui.labels.minAmountApply} (${setting?.currencySymbol})`",
  ],
  [
    "Header: `Price  ${\"(\" + setting?.currencySymbol + \")\"}`",
    "Header: `${col.price} (${setting?.currencySymbol})`",
  ],
  [
    "Header: `Price ( ${setting?.currencySymbol} )`",
    "Header: `${col.price} (${setting?.currencySymbol})`",
  ],
];

for (const app of ["salon", "frontend"]) {
  const key = app === "salon" ? "SKEDISY_SALON_UI" : "SKEDISY_ADMIN_UI";
  const comp = path.join(root, app, "src", "component");
  function walk(d, a = []) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p, a);
      else if (f.endsWith(".js")) a.push(p);
    }
    return a;
  }
  for (const f of walk(comp)) {
    let c = fs.readFileSync(f, "utf8");
    let ch = false;
    for (const [from, to] of MAP) {
      if (c.includes(from)) {
        c = c.split(from).join(to);
        ch = true;
      }
    }
    if (!ch) continue;
    if (!c.includes("tableHeaders") && c.includes("col.")) {
      const rel = path
        .relative(path.dirname(f), path.join(root, app, "src", "constants", "tableHeaders.js"))
        .replace(/\\/g, "/")
        .replace(/\.js$/, "");
      const line = `import { col } from "${rel}";\n`;
      const m = c.match(/^import .+;\r?\n/m);
      if (m && !c.includes(rel)) {
        const idx = c.indexOf(m[0]) + m[0].length;
        c = c.slice(0, idx) + line + c.slice(idx);
      }
    }
    if (c.includes("ui.labels.minAmountApply") && !c.includes("skedisyUiCopy")) {
      const relUi = path
        .relative(path.dirname(f), path.join(root, app, "src", "constants", "skedisyUiCopy.js"))
        .replace(/\\/g, "/")
        .replace(/\.js$/, "");
      const line = `import { ${key} as ui } from "${relUi}";\n`;
      const m = c.match(/^import .+;\r?\n/m);
      if (m) {
        const idx = c.indexOf(m[0]) + m[0].length;
        c = c.slice(0, idx) + line + c.slice(idx);
      }
    }
    fs.writeFileSync(f, c);
    console.log(app, path.relative(comp, f));
  }
}
console.log("headers v3 done");
