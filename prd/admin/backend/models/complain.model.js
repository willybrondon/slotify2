const mongoose = require('mongoose');
const { COMPLAIN_TYPE, COMPLAIN_PERSON } = require('../types/constant');


const complainSchema = new mongoose.Schema(
    {
        expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
        bookingId: { type: Number, default: '' },
        details: { type: String, default: '' },
        image: { type: String, default: '' },
        type: {type:Number,default:0,enum:COMPLAIN_TYPE}, // 0 for pending,1 for solved
        date: { type: String, default: new Date().toLocaleString() },
        solvedDate: { type: String },
        person:{type:Number,enum:COMPLAIN_PERSON},
        bookingData:{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

complainSchema.index({ expertId: 1 });
complainSchema.index({ userId: 1 });
complainSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Complain', complainSchema);


