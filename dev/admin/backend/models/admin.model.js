const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, require: true },
    password: { type: String, trim: true, required: true },
    image: { type: String, trim: true, required: true },
    purchaseCode: { type: String, trim: true, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Admin", adminSchema);
