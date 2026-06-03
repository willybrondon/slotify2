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
  for (const f of walk(path.join(root, app, "src", "component"))) {
    let c = fs.readFileSync(f, "utf8");
    const orig = c;
    c = c.replace(/`ui\.dialog\.(\w+)`/g, "ui.dialog.$1");
    c = c.replace(/>(\s*)ui\.dialog\.(\w+)(\s*)</g, ">$1{ui.dialog.$2}$3<");
    if (c !== orig) {
      fs.writeFileSync(f, c);
      n++;
      console.log(path.relative(root, f));
    }
  }
}
console.log("fixed", n);
