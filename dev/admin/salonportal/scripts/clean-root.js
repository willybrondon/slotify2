/**
 * Remove legacy flat deploy files from salonportal root.
 * Source of truth: src/ → build output: public/
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const keep = new Set([
  "src",
  "scripts",
  "public",
  "node_modules",
  "package.json",
  "package-lock.json",
  "README.md",
  ".gitignore",
]);

let removed = 0;
for (const name of fs.readdirSync(ROOT)) {
  if (keep.has(name)) continue;
  const target = path.join(ROOT, name);
  fs.rmSync(target, { recursive: true, force: true });
  console.log("removed:", name);
  removed += 1;
}
console.log(`Cleaned ${removed} root item(s). Keep editing src/ and run npm run build.`);
