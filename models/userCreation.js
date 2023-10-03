require('dotenv').config();
const mongoose = require('mongoose')
mongoose.connect("process.env.DATABASE_ACCESS_URL")

const userSetupSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }

})

const userStuff = mongoose.model('userInfo', userSetupSchema)
module.exports = userStuff
