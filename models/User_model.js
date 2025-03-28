const mongoose = require('mongoose');
const Department = require('./department_model');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department:{
    type: String,
    required: true
  },
  employeeId:{
    type: String,
    required: true
  },
  role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
  },
    email: {
    type: String,
    required: true
  },   
    password: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('User', UserSchema);