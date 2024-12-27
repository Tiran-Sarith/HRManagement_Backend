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
        type: String,
        required: true,
    },
    
    hireType: {
        type: String,
        required: true,
        //enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
    },
    //deadline ?
    deadline: {
        type: String,
        required: true
    
    },
    //job id
    jobID: {
        type: String,
        required: true
    
    },
    //department
    department: {
        type: String,
        required: true
    
    },
    // jod name -> job title
    // what about the desgnation
    designation: {
        type: String,
        required: true
    
    },


})

const Vacancy = mongoose.model('vacancy', vacancySchema);
module.exports = Vacancy;