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
let n = 0;
for (const app of ["salon", "frontend"]) {
  const comp = path.join(root, app, "src", "component");
  for (const f of walk(comp)) {
    let c = fs.readFileSync(f, "utf8");
    const orig = c;
    c = c.replace(/"ui\.dialog\.([^"]+)"/g, "ui.dialog.$1");
    c = c.replace(/placeholder="ui\.dialog\.(\w+)"/g, "placeholder={ui.dialog.$1}");
    c = c.replace(/label="ui\.dialog\.(\w+)"/g, "label={ui.dialog.$1}");
    if (c !== orig) {
      fs.writeFileSync(f, c);
      n++;
    }
  }
}
console.log("fixed", n, "files");
