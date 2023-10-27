require('dotenv').config();
const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')

mongoose.connect(process.env.DATABASE_ACCESS_URL)

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
    },

    googleId: {
        type: String
    },

    verified: {
        type: Boolean,
        default: false
    }

})
userSetupSchema.plugin(findOrCreate);
const userStuff = mongoose.model('userInfo', userSetupSchema)
module.exports = userStuff
