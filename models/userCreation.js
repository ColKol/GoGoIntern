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
    },

    password: {
        type: String,
    },

    googleId: {
        type: String
    }

})
userSetupSchema.plugin(findOrCreate);
const userStuff = mongoose.model('userInfo', userSetupSchema)
module.exports = userStuff
