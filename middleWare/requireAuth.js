const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const requireAuth = async(req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Authentication invalid.' });
    }
    mongoose.models.InvalidTokens.countDocuments({ token: token.split(' ')[1] }).catch(e => {
        return res.status(500).json({ message: "Internal Server Error" });
    }).then(count => {
        if (count) return res.status(403).json({ message: "Already Logged Out" });
        try {
            const decodedToken = jwt.verify(token.split(' ')[1], process.env.JWT_SIGN_SECRET, {
                algorithm: 'HS256',
                expiresIn: process.env.JWT_EXPIRE
            });
            mongoose.models.Users.countDocuments({ _id: decodedToken.id }).then(UserCount => {
                if (!UserCount) return res.status(401).json({ message: "Token resolves to invalid user" });
                req.user = decodedToken;
                next();
            }).catch(e => {
                throw new Error("Token resolves to invalid user");
            });

        } catch (error) {
            return res.status(401).json({
                message: error.message
            });
        }
    });

};

module.exports = requireAuth;