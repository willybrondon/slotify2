const mongoose = require("mongoose");
require("dotenv").config();

const uri = String(process.env.MONGODB_CONNECTION_STRING || "").trim();
if (!uri || !/^mongodb(\+srv)?:\/\//i.test(uri)) {
  console.warn(
    "[MongoDB] Skipping connect — set a valid MONGODB_CONNECTION_STRING in .env (needed for APIs; HTML onboarding still works)."
  );
} else {
  mongoose
    .connect(uri)
    .then(() => {
      console.log(`Database connected`);
    })
    .catch((err) => {
      console.error("[MongoDB] Connection failed:", err.message);
    });
}
