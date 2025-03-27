const User = require('../models/User_model');
const bcrypt = require('bcryptjs');

async function createAdminAccount() {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
            const newAdmin = new User({
                email: "admin@test.com",
                name: "Admin",
                department: "Admin",
                employeeId: "123456",
                role: "admin",
                password: await bcrypt.hash("admin", 10)
            });
            await newAdmin.save();
            console.log("Admin account created successfully");
        } else {
            console.log("Admin account already exists");
        }
    }   catch (error) {
        console.error(error.message);
    }

}
module.exports = createAdminAccount;