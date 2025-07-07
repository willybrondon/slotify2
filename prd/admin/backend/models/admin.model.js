const mongoose = require('mongoose')
const validate = require('validator')

const adminSchema = new mongoose.Schema(
    {
        name:String,
        email:{
            type:String,
            require:true,
        },
        password:{
            type:String,
            required:true,
        },
        flag: { type: Boolean, default: false },
        image:String,
        purchaseCode:String
        
    },
    {
        timestamps: true,
        versionKey:false
    }
)

module.exports =  mongoose.model("Admin",adminSchema)