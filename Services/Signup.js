const User = require('../models/User_model');
const bcrypt = require('bcryptjs');

async function createUser(userData) {
  const { name,department,employeeId,role, email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10); // Hashing the password
  const createUser = new User({
    name,
    department,
    employeeId,
    role,
    email,
    password: hashedPassword, // Assign hashed password to the correct field
    role
  });
  return createUser.save();
}

module.exports = {
  createUser
};