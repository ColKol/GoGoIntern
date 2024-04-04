const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true
    },

    creatorName: {
        type: String,
        required: true
    },

    nameOfInternship: {
        type: String,
        required: true
    },

    typeOfInternship: {
        type: Array,
        required: true,
    },

    internshipTypeForWorking: {
        type: String,
        required: true
    },

    wageType: {
        type: String,
        required: true
    },

    wage: {
        type: String
    },

    description: {
        type: String,
        required: true,
    },

    skillsRequired: {
        type: Array,
        required: true,
    },

    workplaceType: {
        type: String,
        required: true
    },

    addressForWork: {
        type: String
    },

    internshipSchedule:{
        type: String
    },

    shiftStart: {
        type: String,
        required: true
    },

    shiftEnd: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
    },

    endDate: {
        type: Date,
    },

    screeningQuestions: {
        type: Array,
        required: true
    },

    personWhoSignedUp: {
        type: String
    }
});

internshipSchema.virtual('isOver').get(function () {
  return Date.now() > this.startDate;
});

const internshipCreator = mongoose.model('internshipCreator', internshipSchema);
module.exports = internshipCreator;