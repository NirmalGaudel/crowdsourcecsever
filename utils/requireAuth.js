const jwt = require('jsonwebtoken');


const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Authentication invalid.' });
    }

    try {
        const decodedToken = jwt.verify(token.split(' ')[1], process.env.JWT_SIGN_SECRET, {
            algorithm: 'HS256',
            expiresIn: process.env.JWT_EXPIRE
        });

        req.user = decodedToken;
        next();

    } catch (error) {
        return res.status(401).json({
            message: error.message
        });
    }
};

module.exports = requireAuth;