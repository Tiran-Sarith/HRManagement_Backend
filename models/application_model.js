const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    vacancyId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    portfolio: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: false
    },
    introduction: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true,
    },
    filename: {
        type: String,
    },
    cvScore: {
        type: Number,
        default: null
    },
    questions: {
        type: [String], // New field to store an array of generated interview questions
        default: []
    },

    answers: {
        type: [String], //employee answers
        default: []
    }
    
});

const Application = mongoose.model('application', applicationSchema);
module.exports = Application;
