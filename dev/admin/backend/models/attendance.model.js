const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      default: "",
    },
    attendCount: {
      type: Number,
      required: true,
      default: 0,
    },
    absentCount: {
      type: Number,
      required: true,
      default: 0,
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
    },
    attendDates: {
      type: [String],
      default: [],
    },
    absentDates: {
      type: [String],
      default: [],
    },
    totalDays: {
      type: Number,
      required: true,
      default: 0,
    },
    checkInTime: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

attendanceSchema.index({ expertId: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
