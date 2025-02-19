const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    
    name: {
        type: String,
        required: true,
        trim: true,
    },
    vacancyId:{
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
    }

});

const Application = mongoose.model('application', applicationSchema);
module.exports = Application;