const fs = require("fs");
const path = require("path");

const headLinks = `    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="\${baseURL}/styles.css">
    <link rel="stylesheet" href="\${baseURL}/public-pages.css">`;

const files = [
  path.join(__dirname, "../controller/user/salon.controller.js"),
  path.join(__dirname, "../controller/user/category.controller.js"),
];

for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const marker =
    '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"';
  const idx = s.indexOf(marker);
  if (idx < 0) {
    console.error("marker not found:", file);
    process.exit(1);
  }
  const styleStart = s.indexOf("    <style>", idx);
  const styleEnd = s.indexOf("    </style>", styleStart);
  if (styleStart < 0 || styleEnd < 0) {
    console.error("style block not found:", file);
    process.exit(1);
  }
  s =
    s.slice(0, idx) +
    headLinks +
    s.slice(styleEnd + "    </style>".length);
  s = s.replace(/<body>/g, '<body class="sk-public-page sq-page">');
  fs.writeFileSync(file, s);
  console.log("OK", path.basename(file));
}
