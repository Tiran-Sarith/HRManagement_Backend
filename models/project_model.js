// models/project_model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true,
    },
    departmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    projectDescription: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    projectManager: {
        type: String,
        required: true,
    },
    projectStatus: {
        type: String,
        required: true,
    },
    projectDeadline: {
        type: Date,
        required: true,
    },
    Number_of_members: {
        type: Number,
        required: true,
    },
    projectCategory: {
        type: String,
        required: true,
    },
    projectBudget: {
        type: Number,
        required: true,
    },
    projectDuration: {
        type: Number,
        required: true,
    },
    
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
