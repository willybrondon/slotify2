const mongoose = require("mongoose");

const blogAdminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

blogAdminSchema.index({ email: 1 });

module.exports = mongoose.model("BlogAdmin", blogAdminSchema);
