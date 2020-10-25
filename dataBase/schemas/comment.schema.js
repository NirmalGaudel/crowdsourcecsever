const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: "ObjectId",
        ref: "Users",
        required: [true, 'author is required for a comment']
    },
    commentContent: {
        type: String,
        required: [true, 'commentContent is required for a comment'],
        maxlength: [2000, 'commentContent must have less than 2000 characters ']
    },
    likes: {
        type: ["ObjectId"],
        ref: 'Users',
        required: true,
        default: []
    },
    postId: {
        type: "ObjectId",
        ref: "Posts",
        required: [true, "postId is required for a comment "]
    }
}, {
    timestamps: true
});

module.exports = commentSchema;