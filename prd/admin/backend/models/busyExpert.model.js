const mongoose = require('mongoose');

const busyExpertSchema = new mongoose.Schema(
    
    {
        expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
        time: [{ type: String, default: '' }],
        date:String
    },
  {
    timestamps: true,
    versionKey: false,
  }
    
)


busyExpertSchema.index({ expertId: 1 });

module.exports = mongoose.model('BusyExpert',busyExpertSchema)