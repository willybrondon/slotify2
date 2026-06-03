const fs = require("fs");
const path = require("path");

function walk(d, a = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (p.endsWith(".js")) a.push(p);
  }
  return a;
}

const root = path.join(__dirname, "..");
for (const app of ["salon", "frontend"]) {
  const set = new Set();
  for (const f of walk(path.join(root, app, "src/component"))) {
    const c = fs.readFileSync(f, "utf8");
    const re = /Header:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(c))) set.add(m[1]);
  }
  console.log("\n=== " + app + " (" + set.size + ") ===");
  console.log([...set].sort().join("\n"));
}
