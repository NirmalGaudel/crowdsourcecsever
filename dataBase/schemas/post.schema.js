const { text } = require('express');
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
    postDescription: {
        type: String,
        required: [true, "the post description is required  "],
        minlength: [20, 'postDescription must be longer than 20 characters'],
        maxlength: [200, 'postDescription must be shorter than 200 characters']
    },
    postContent: {
        type: String,
        required: [true, 'postContent is required for a post'],
        minlength: [20, 'Post must be longer than 20 characters'],
        maxlength: [2000, 'Post must be shorter than 2000 characters']
    },
    postLinks: {
        type: [String],
        default: []
    },
    postCoverURL: {
        type: String,
        required: [true, 'Post requires postCoverURL'],
        default: ''
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