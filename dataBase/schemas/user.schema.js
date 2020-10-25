const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'Username is required'],
        maxlength: [32, 'Username can\'t be longer than 32 characters'],
        minlength: [3, 'Username can\'t be shorter than 3 characters'],
        unique: [true, 'userName already taken']
    },
    email: {
        type: String,
        lowercase: true,
        maxlength: [128, 'Email can\'t be greater than 128 characters'],
        index: true
    },
    firstName: {
        type: String,
        required: [true, 'firstName is required'],
        maxlength: [20, 'firstName can\'t be longer than 20 characters'],
        minlength: [3, 'firstName can\'t be shorter than 3 characters']
    },
    middleName: {
        type: String,
        maxlength: [20, 'middleName can\'t be longer than 20 characters'],
        minlength: [3, 'middleName can\'t be shorter than 3 characters']
    },
    lastName: {
        type: String,
        required: [true, 'lastName is required'],
        maxlength: [20, 'lastName can\'t be longer than 20 characters'],
        minlength: [3, 'lastName can\'t be shorter than 3 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'O']
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio can\'t be longer than 200 characters']
    },
    imagePath: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    intrests: {
        type: [String],
        default: []
    },
    posts: [{
        type: "ObjectId",
        ref: "Posts"
    }],
    comments: {
        type: ['ObjectId'],
        ref: 'Comments'
    },
    likes: {
        type: ['ObjectId'],
        ref: 'Posts'
    }
}, {
    timestamps: true
});

module.exports = userSchema;