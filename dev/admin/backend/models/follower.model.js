const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //follower (from)
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon" }, //following (to)
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

followerSchema.index({ userId: 1 });
followerSchema.index({ salonId: 1 });

module.exports = mongoose.model("Follower", followerSchema);
