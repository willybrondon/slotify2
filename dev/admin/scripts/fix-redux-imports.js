const fs = require("fs");
const path = require("path");

function fixSliceDir(sliceDir, importLine) {
  for (const file of fs.readdirSync(sliceDir)) {
    if (!file.endsWith(".js")) continue;
    const p = path.join(sliceDir, file);
    let c = fs.readFileSync(p, "utf8");
    if (!c.includes("Success(ui.") && !c.includes("DangerRight(ui.")) continue;
    if (c.includes("skedisyUiCopy")) continue;
    const lines = c.split("\n");
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) insertAt = i + 1;
      else if (insertAt > 0) break;
    }
    lines.splice(insertAt, 0, importLine.trim());
    fs.writeFileSync(p, lines.join("\n") + (c.endsWith("\n") ? "" : "\n"));
    console.log("fixed", file);
  }
}

const root = path.join(__dirname, "..");
fixSliceDir(
  path.join(root, "salon", "src", "redux", "slice"),
  'import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";'
);
fixSliceDir(
  path.join(root, "frontend", "src", "redux", "slice"),
  'import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";'
);
