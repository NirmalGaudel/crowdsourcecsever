const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    author: {
        type: 'ObjectId',
        ref: 'Users',
        requird: [true, 'author is required']
    },

    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    likes: {

        type: [{
            type: 'ObjectId',
            ref: 'Users',
        }],
        default: []
    },
    comments: {
        type: ['ObjectId'],
        ref: 'Comments',
        default: []
    },
    postTitle: {
        type: String,
        required: false,
        maxlength: [100, 'Title must be shorter than 100 characters'],
    },
    postContent: {
        type: String,
        required: [true, 'postContent is required for a post'],
        minlength: [10, 'Post must be longer than 10 characters'],
        maxlength: [2000, 'Post must be shorter than 2000 characters']
    },
    postLinks: {
        type: [String],
        default: []
    },
    postImagesPath: {
        type: [String],
        required: [true, 'Post requires postImagesPath'],
        default: []
    },
    tags: {
        type: [String],
        required: [true, 'Post requires tags']
    },
    reports: {
        type: [String],
        required: false,
        default: []
    },
    views: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = postSchema;