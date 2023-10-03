const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://col:EiMdF5oa5GHg2m2m@rayreader.2h3kpsv.mongodb.net/?retryWrites=true&w=majority")

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