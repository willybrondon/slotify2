/**
 * Build salonportal: copy organized src/ → public/ (URL-stable layout for Express).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(to);
  for (const name of fs.readdirSync(from)) {
    const srcPath = path.join(from, name);
    const destPath = path.join(to, name);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function build() {
  if (!fs.existsSync(SRC)) {
    console.error("Missing src/. Nothing to build.");
    process.exit(1);
  }

  rmDir(PUBLIC);
  ensureDir(PUBLIC);

  copyDir(path.join(SRC, "pages"), PUBLIC);

  const stylesDir = path.join(SRC, "styles");
  if (fs.existsSync(stylesDir)) {
    for (const name of fs.readdirSync(stylesDir)) {
      if (name.endsWith(".css")) {
        copyFile(path.join(stylesDir, name), path.join(PUBLIC, name));
      }
    }
  }

  function copyAllJs(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) {
        copyAllJs(p);
      } else if (name.endsWith(".js")) {
        copyFile(p, path.join(PUBLIC, name));
      }
    }
  }
  copyAllJs(path.join(SRC, "js"));

  const componentsDir = path.join(SRC, "components");
  if (fs.existsSync(componentsDir)) {
    for (const name of fs.readdirSync(componentsDir)) {
      const p = path.join(componentsDir, name);
      if (fs.statSync(p).isFile() && (name.endsWith(".js") || name.endsWith(".css"))) {
        copyFile(p, path.join(PUBLIC, name));
      }
    }
  }

  const assetsDir = path.join(SRC, "assets");
  if (fs.existsSync(path.join(assetsDir, "images"))) {
    copyDir(path.join(assetsDir, "images"), path.join(PUBLIC, "images"));
  }
  for (const fav of ["favicon.ico", "favicon.svg"]) {
    const favPath = path.join(assetsDir, fav);
    if (fs.existsSync(favPath)) {
      copyFile(favPath, path.join(PUBLIC, fav));
    }
  }

  console.log("Built → public/");
}

build();
