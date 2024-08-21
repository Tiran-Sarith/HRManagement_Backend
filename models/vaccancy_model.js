const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vacancySchema = new Schema({
    
    jobTitle: {
        type: String,
        required: true,
        trim: true,
    },
    jobDescription: {
        type: String,
        required: true
    },
    jobCategory: {
        type: String,
        required: true
    
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    
    hireType: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
    }


    //deadline ?
    //job id
    //department
    // jod name -> job title
    // what about the desgnation


})

const Vacancy = mongoose.model('vacancy', vacancySchema);
module.exports = Vacancy;