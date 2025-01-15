const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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
        type: Number,
        required: false
    },
    introduction: {
        type: String,
        required: true
    },
    vacancy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vacancy',
        required: true
    },
    filename: {
        type: String,
        required: true
    }
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
