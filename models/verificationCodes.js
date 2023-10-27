const mongoose = require('mongoose')

const verificationSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    verificationCode: {
        type: Number,
        required: true
    }
})

const verificationCodes = mongoose.model('verificationCode', verificationSchema)
module.exports = verificationCodes