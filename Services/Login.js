const bcrypt = require('bcryptjs');
const User = require('../models/User_model');
const {generateToken} = require('../Utils/jwtUtils');

async function login(email, password) {
    try{
        const existingUser = await User.findOne({email});
        if(!existingUser) throw new Error("User not found");

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect) throw new Error("Invalid credentials");

        const token = generateToken(existingUser);
        return token;
    }
    catch(error){
        throw new Error(error.message);
    }
}

module.exports = {
    login
};