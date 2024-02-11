const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  verificationCode: {
    type: Number,
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: 180,
  },
});

const verificationCodes = mongoose.model('verificationCode', verificationSchema);
module.exports = verificationCodes;