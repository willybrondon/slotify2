const fs = require("fs");
const path = require("path");

const portalDir = path.join(__dirname, "../../salonportal");
const exts = new Set([".html", ".css"]);

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules") continue;
      walk(full);
    } else if (exts.has(path.extname(name))) {
      let s = fs.readFileSync(full, "utf8");
      const orig = s;
      s = s.replace(/#3498db/gi, "#111");
      s = s.replace(/#2980b9/gi, "#333");
      s = s.replace(/#667eea/gi, "#111");
      s = s.replace(/#764ba2/gi, "#333");
      if (s !== orig) {
        fs.writeFileSync(full, s);
        console.log("updated", path.relative(portalDir, full));
      }
    }
  }
}

walk(portalDir);
console.log("done");
