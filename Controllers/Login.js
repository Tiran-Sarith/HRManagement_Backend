const authService = require('../Services/Login');

async function login(req, res) {

    try {
        const { email, password} = req.body;
        const token = await authService.login(email, password);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    login
};