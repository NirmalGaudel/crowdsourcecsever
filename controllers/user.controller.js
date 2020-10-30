const { validationResult } = require("express-validator");
const invalidTokenModel = require("../dataBase/models/expiredToken.model");
const userModel = require("../dataBase/models/user.model");
const mongoose = require("../dataBase/utils/dbConnect");
const { hashPassword, verifyPassword, createToken } = require("../utils/authenticate");

async function signUp(req, res) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(400).json(result.errors);
    try {
        let { userName, firstName, middleName, lastName, email, gender, bio, imagePath } = req.body;
        const hashedPassword = await hashPassword(req.body.password).catch(e => {
            e.status = 500;
            throw e;
        });

        firstName = firstName.trim().replace(' ', '');
        if (middleName) middleName = middleName.trim().replace(' ', '');
        const userData = { userName, firstName, middleName, lastName, email, gender, bio, imagePath, password: hashedPassword };
        const user = userModel(userData);
        await user.save().catch(e => {
            e.status = 409;
            throw e;
        });
        delete userData.password;
        return res.status(201).json({ _id: user._id, ...userData });

    } catch (error) {
        return res.status(error.status || 400).json(error);
    }
}

async function authenticate(req, res) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(400).json(result.errors);
    try {
        const { userName, password } = req.body;
        if (!userName || !password) return res.status(403).json({ message: "Username or password not valid" });
        const user = await mongoose.models.Users.findOne({ userName }).catch(e => res.status(403).json({ message: "Username or password not valid" }));
        if (!user) return res.status(403).json({ message: "Username or password not valid" });
        const passwordMatch = await verifyPassword(password, user.password);
        if (passwordMatch) {
            const token = createToken(user);
            const { userName, firstName, middleName, lastName, _id, imagePath } = user;
            const userInfo = { userName, firstName, middleName, lastName, _id, imagePath };
            res.status(202).json({ message: 'Authentication successful!', token, userInfo });
        } else { return res.status(403).json({ message: "Username or password not valid" }); }

    } catch (error) {
        return res.status(error.status || 403).json(error);
    };
}

async function getUser(req, res) {
    const targetUser = req.params.targetUser;
    if (!targetUser) res.status(400).json({ message: "provide userName, email or userId" });
    const getTargetUser = async(tu) => {
        if (mongoose.isValidObjectId(tu)) return await mongoose.models.Users.findById(tu).populate('posts', ['_id', 'postTitle', 'views', 'tags', 'createdAt', "verified"]).catch(e => null);
        return await mongoose.models.Users.findOne({ $or: [{ email: tu }, { userName: tu }] }).populate('posts', ['_id', 'postTitle', 'views', 'tags', 'createdAt', "verified"]).catch(e => null);
    };
    let userData = await getTargetUser(targetUser);
    if (!userData) return res.json({ message: "User Not found" })
    const { _id, userName, firstName, middleName, lastName, email, gender, imagePath, bio, posts } = userData;
    const fullName = firstName + ((middleName) ? ` ${middleName} ` : ' ') + lastName;
    return res.json({ _id, userName, fullName, imagePath, email, bio, posts, gender });
}

async function listUsers(req, res) {
    const users = await mongoose.models.Users.find({}).catch(_ => []);
    const responseData = [];
    users.forEach(user => {
        const { _id, userName, firstName, middleName, lastName, imagePath, email, posts, verified } = user;
        const postCount = posts.length;
        const fullName = firstName + ((middleName) ? ` ${middleName} ` : ' ') + lastName;
        responseData.push({ _id, userName, imagePath, fullName, email, verified, postCount });
    })
    return res.send(responseData);
}

async function searchUsers(req, res) {
    const searchString = req.params.search.toLowerCase();
    if (!searchString || (searchString.length <= 1)) return res.status(400).json({ message: "provide search with min length 2 " });
    const users = await mongoose.models.Users.find({}).catch(_ => []);
    const responseData = [];
    users.forEach(user => {
        const { userName, firstName, middleName, lastName, imagePath, email, posts } = user;
        const postCount = posts.length;
        const fullName = firstName + ((middleName) ? ` ${middleName} ` : ' ') + lastName;
        if (fullName.toLowerCase().includes(searchString) || userName.toLowerCase().includes(searchString) || email.includes(searchString)) {
            responseData.push({ userName, imagePath, fullName, email, postCount });
        }
    })
    return res.send(responseData);
}

async function validateToken(req, res) {
    const responseData = {
        message: "token valid"
    }
    return res.status(202).json(responseData);
}

async function editUserDetails(req, res) {
    const userId = req.params.userId || null;
    if (req.user.id !== userId) return res.status(401).json({ message: 'authentication failed' });
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(400).json(result.errors);
    const { userName, email, firstName, middleName, lastName, imagePath, bio, gender, intrests } = req.body;
    const updatedData = { userName, email, firstName, middleName, lastName, imagePath, bio, gender, intrests };
    for (const key of Object.keys(updatedData)) {
        if (updatedData[key] == null) {
            delete updatedData[key];
        }
    }
    const previousData = await mongoose.models.Users.findOneAndUpdate(userId, updatedData).then(d => {
        const { userName, email, firstName, middleName, lastName, imagePath, bio, gender, intrests } = d;
        return { userName, email, firstName, middleName, lastName, imagePath, bio, gender, intrests };
    }).catch(_ => null);

    return res.status(previousData ? 200 : 500).json({ previousData, updatedData });
}


async function deleteUser(req, res) {
    const userId = req.params.userId || null;
    if (req.user.id !== userId) return res.status(401).json({ message: 'authentication failed' });
    const userData = await mongoose.models.Users.findById(userId).catch(_ => null);
    if (!userData) return res.status(404).json({ message: "User not found" });
    try {
        const deleteResult = await userData.deleteUser();
        const responseData = { message: deleteResult.message || deleteResult };
        if (deleteResult.undeletedPosts || null) {
            responseData.undeletedPosts = deleteResult.undeletedPosts;
        }
        return res.status(deleteResult.status || 200).json(responseData);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || "internal server error" })
    }


}

async function logOut(req, res) {
    try {
        const token = ((req.headers.authorization).split(' '))[1]
        const invalidToken = invalidTokenModel({ tokenDate: Date.now(), token });
        await invalidToken.save();
        return res.status(200).json({ message: "Loged out", token });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function changePassword(req, res) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(400).json(result.errors);
    try {
        const hashedPassword = await hashPassword(req.body.password).catch(e => {
            e.status = 500;
            throw e;
        });
        await mongoose.models.Users.findByIdAndUpdate(req.user.id, { password: hashedPassword });
        logOut(req, res);

    } catch (err) {
        return res.status(err.status || 400).json(err);
    }

}

module.exports = { signUp, authenticate, getUser, listUsers, searchUsers, validateToken, editUserDetails, deleteUser, logOut, changePassword };