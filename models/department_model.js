// models/department_model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    departmentID: {
        type: String,
        required: true,
    },
    departmentName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    Numberofemployees: {
        type: Number,
        required: true,
    },
    departmentHead: {
        type: String,
        required: true,
    },
    Numberodprojects: {
        type: Number,
        required: true,
    },
    departmentLocation: {
        type: String,
        required: true,
    }
    
});

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
