const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: String,
    nameEn: { type: String, trim: true }, // English translation
    nameFr: { type: String, trim: true }, // French translation
    namePt: { type: String, trim: true }, // Portuguese translation
    // price: Number,
    image: String,
    duration: Number,
    status: { type: Boolean, default: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Service", serviceSchema);
