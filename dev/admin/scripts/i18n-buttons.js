const fs = require("fs");
const path = require("path");

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".js")) {
      let c = fs.readFileSync(p, "utf8");
      const n = c
        .replace(/text=\{`Cancel`\}/g, 'text="Annuler"')
        .replace(/text=\{`Submit`\}/g, 'text="Enregistrer"')
        .replace(/text=\{`Delete`\}/g, 'text="Supprimer"')
        .replace(/text="Cancel"/g, 'text="Annuler"')
        .replace(/text="Submit"/g, 'text="Enregistrer"');
      if (n !== c) fs.writeFileSync(p, n);
    }
  }
}

const root = path.join(__dirname, "..");
walk(path.join(root, "salon", "src"));
walk(path.join(root, "frontend", "src"));
console.log("button labels updated");
