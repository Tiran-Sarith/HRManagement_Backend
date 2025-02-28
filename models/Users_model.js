const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    employeeId: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    email: {
        type: String, // Change this from Date to String
        required: true, // Ensure email is required
        trim: true,
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(v); // Email validation regex
            },
            message: props => `${props.value} is not a valid email!`
        }
    }
});

const User = mongoose.model('User', usersSchema);
module.exports = User;
