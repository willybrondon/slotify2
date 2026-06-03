const fs = require("fs");
const path = require("path");

const REPLACEMENTS = [
  [/Cancel booking/g, "ui.dialog.cancelBooking"],
  [/Complete booking/gi, "ui.dialog.completeBooking"],
  [/Reason is Required !/g, "ui.dialog.reasonRequired"],
  [/Reason is Required/g, "ui.dialog.reasonRequired"],
  [/label=\{`Reason`\}/g, "label={ui.dialog.reason}"],
  [/placeholder=\{`Reason`\}/g, "placeholder={ui.dialog.reason}"],
  [/<h3 className="text-theme m0">Reason<\/h3>/g, '<h3 className="text-theme m0">{ui.dialog.reason}</h3>'],
  [/Price cannot be greater than MRP/g, "ui.dialog.priceAboveMrp"],
];

function walk(d, a = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (p.endsWith(".js")) a.push(p);
  }
  return a;
}

function ensureUiImport(c, app) {
  const uiImport =
    app === "salon"
      ? 'import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";\n'
      : 'import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";\n';
  if (c.includes("skedisyUiCopy")) return c;
  const depth = (c.match(/from "\.\.\//g) || []).length;
  const rel =
    app === "salon"
      ? "../".repeat(Math.max(2, Math.min(4, depth))) + "constants/skedisyUiCopy"
      : "../".repeat(Math.max(2, Math.min(4, depth))) + "constants/skedisyUiCopy";
  const line = `import { SKEDISY_${app === "salon" ? "SALON" : "ADMIN"}_UI as ui } from "${rel}";\n`;
  const m = c.match(/^import .+;\n/m);
  if (m) {
    const idx = c.indexOf(m[0]) + m[0].length;
    return c.slice(0, idx) + line + c.slice(idx);
  }
  return line + c;
}

function fixImportPath(filePath, c, app) {
  if (c.includes("skedisyUiCopy")) return c;
  const constants = path.join(
    path.dirname(filePath),
    app === "salon" ? "../../../constants/skedisyUiCopy" : "../../../constants/skedisyUiCopy"
  );
  const rel = path
    .relative(path.dirname(filePath), path.join(path.dirname(filePath), "..", "..", "constants", "skedisyUiCopy.js"))
    .replace(/\\/g, "/")
    .replace(/\.js$/, "");
  const exportName = app === "salon" ? "SKEDISY_SALON_UI" : "SKEDISY_ADMIN_UI";
  const line = `import { ${exportName} as ui } from "${rel}";\n`;
  const m = c.match(/^import .+;\n/m);
  if (m) {
    const idx = c.indexOf(m[0]) + m[0].length;
    return c.slice(0, idx) + line + c.slice(idx);
  }
  return line + c;
}

const root = path.join(__dirname, "..");

// extend dialog keys in copy files
for (const [file, exportConst] of [
  [path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"), "SKEDISY_SALON_UI"],
  [path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"), "SKEDISY_ADMIN_UI"],
]) {
  let c = fs.readFileSync(file, "utf8");
  if (!c.includes("completeBooking:")) {
    c = c.replace(
      /cancelBooking: "[^"]+",/,
      (m) =>
        m +
        '\n    completeBooking: "Terminer la réservation",' +
        '\n    reason: "Motif",' +
        '\n    reasonRequired: "Le motif est requis.",' +
        '\n    priceAboveMrp: "Le prix ne peut pas dépasser le prix public.",'
    );
  }
  fs.writeFileSync(file, c);
}

let n = 0;
for (const app of ["salon", "frontend"]) {
  const comp = path.join(root, app, "src", "component");
  for (const f of walk(comp)) {
    if (!/Dialog|Dialogue|CancleDetails/.test(f)) continue;
    let c = fs.readFileSync(f, "utf8");
    let changed = false;
    for (const [re, rep] of REPLACEMENTS) {
      if (re.test(c)) {
        c = c.replace(re, (match) => {
          if (rep.startsWith("ui.")) return `{${rep}}`;
          return rep;
        });
        changed = true;
      }
    }
    if (!changed) continue;
    if (!c.includes("skedisyUiCopy")) {
      const rel = path
        .relative(
          path.dirname(f),
          path.join(root, app, "src", "constants", "skedisyUiCopy.js")
        )
        .replace(/\\/g, "/")
        .replace(/\.js$/, "");
      const exportName = app === "salon" ? "SKEDISY_SALON_UI" : "SKEDISY_ADMIN_UI";
      const line = `import { ${exportName} as ui } from "${rel}";\n`;
      const m = c.match(/^import .+;\n/m);
      if (m) {
        const idx = c.indexOf(m[0]) + m[0].length;
        c = c.slice(0, idx) + line + c.slice(idx);
      }
    }
    fs.writeFileSync(f, c);
    n++;
    console.log(app, path.relative(comp, f));
  }
}
console.log("dialogs", n);
