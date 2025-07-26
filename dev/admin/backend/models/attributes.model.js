const mongoose = require("mongoose");

const attributesSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    value: { type: Array, default: [] },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

attributesSchema.index({ salonId: 1 });
attributesSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Attributes", attributesSchema);
