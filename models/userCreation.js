require('dotenv').config();
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_ACCESS_URL)

const userSetupSchema = new mongoose.Schema({
    userType:{
        type: String,
        required: true,
    },
    
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        lowercase: true,
        required: true
    },

    password: {
        type: String
    },

    googleId: {
        type: String
    },

    verified: {
        type: Boolean,
        default: false
    },

    firstTime: {
        type: Boolean,
        default: false,
    },

    interests:{
        type: Array
    },

    cv:{
        type: String,
    },

    address:{
        type: String,
    },

    description:{
        type: String
    },

    companyLink:{
        type: String,
    },



})
const userStuff = mongoose.model('userInfo', userSetupSchema)
module.exports = userStuff
