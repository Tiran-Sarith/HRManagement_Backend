const userServices = require('../Services/Signup');

async function createUser(req, res) {
  try {
    const {name,department,employeeId,role, email, password } = req.body;

    // Ensure all required fields are present
    if (!name || !department || !employeeId || !role || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Pass valid data to the service
    const user = await userServices.createUser(req.body);
    res.status(201).json(user); // User created successfully
  } catch (error) {
    res.status(400).json({ message: error.message }); // Return error message
  }
}


module.exports = {
  createUser
};