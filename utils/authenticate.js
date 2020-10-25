const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const createToken = (user) => {
    return jwt.sign({
            id: user._id,
            userName: user.userName
        },
        process.env.JWT_SIGN_SECRET, { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRE }
    );
};

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        // Generate a salt at level 12 strength
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });

    });
};

const verifyPassword = (passwordAttempt, hashedPassword) => {
    return bcrypt.compare(passwordAttempt, hashedPassword);
    // return (passwordAttempt == hashedPassword);
};


module.exports = { createToken, hashPassword, verifyPassword };