const { validationResult } = require("express-validator");
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
    if (result.errors.length > 0) res.status(400).json(result.errors);
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
        res.status(error.status || 403).json(error);
    };
}

async function getUser(req, res) {
    const targetUser = req.params.targetUser;
    if (!targetUser) res.status(400).json({ message: "provide userName, email or userId" });
    const getTargetUser = async(tu) => {
        if (mongoose.isValidObjectId(tu)) return await mongoose.models.Users.findById(tu).catch(e => null);
        return await mongoose.models.Users.findOne({ $or: [{ email: tu }, { userName: tu }] }).catch(e => null);
    };
    let userData = await getTargetUser(targetUser);
    if (!userData) return res.json({ message: "User Not found" })
    userData = await mongoose.models.Users.findById(userData._id).populate('posts', ['_id', 'postTitle', 'views', 'tags', 'createdAt', "verified"]);

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
    res.send(responseData);
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

module.exports = { signUp, authenticate, getUser, listUsers, searchUsers };