const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    nameEn: { type: String, trim: true }, // English translation
    nameFr: { type: String, trim: true }, // French translation
    namePt: { type: String, trim: true }, // Portuguese translation
    image: { type: String, trim: true },
    status: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Category", categorySchema);
