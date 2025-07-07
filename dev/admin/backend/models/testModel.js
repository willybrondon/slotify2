const mongoose = require("mongoose");
const moment = require("moment");
const testSchema = new mongoose.Schema(
  {
    string: [{ type: String, unique: true }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Test", testSchema);
