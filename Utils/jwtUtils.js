const jwt = require('jsonwebtoken');
const { secretKey } = require('../Configuration/jwtConfig');

function generateToken(user) {
    const payload = {  
        name: user.name,
        department: user.department,
        employeeId: user.employeeId,
        role: user.role,
        email: user.email,
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

module.exports = {
    generateToken,
};