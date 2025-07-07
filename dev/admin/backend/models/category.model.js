const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    status: { type: Boolean, default: true },
    isDelete:{type: Boolean,default: false},

  },
  {
    timestamps: true,
    versionKey: false,
  }
);



module.exports =  mongoose.model("Category",categorySchema)