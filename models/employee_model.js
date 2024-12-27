const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const   employeeSchema = new Schema({
    employee_full_name: {
        type: String,
        required: true,
        trim: true,
    },

    employee_name_with_initials: {
        type: String,
        required: true,
        trim: true,
    },

    employee_first_name: {
        type: String,
        required: true,
        trim: true,
    },
    
    employee_last_name: {
        type: String,
        required: true,
        trim: true,
    },

    employee_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    employee_email: {
        type: String,
        //required: true,
        trim: true
    },

    employee_nic: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    employee_telephone:{
        type: String,
        required: true
    },

    employee_address:{
        type: String,
        required: true
    },

    employee_designation:{
        type: String,
        
    },

    employee_current_project_id:{
        type: String,
    },

    employee_department:{
        type: String
    }

    


});

// Ensure unique indexes programmatically
employeeSchema.index({ employee_id: 1 }, { unique: true });
employeeSchema.index({ employee_nic: 1 }, { unique: true });

const Employee = mongoose.model('employee', employeeSchema);
module.exports = Employee;