const { validationResult } = require("express-validator");
const postModel = require("../dataBase/models/post.model");
const mongoose = require("mongoose");
const { post } = require("../dataBase/schemas/tag.schema");


async function createPost(req, res) {
    //validation result already checked while managing tags
    try {
        const { postTitle, postContent, postCoverURL, tags, postDescription } = req.body;
        const newPost = new postModel({ author: req.user.id, postTitle, postContent, postCoverURL, tags, postDescription });
        const savedPost = await newPost.save();
        return res.status(201).json(savedPost);
    } catch (error) {
        const { status, message } = error;
        res.status(status || 400).json({ message })
    }
}

async function updatePost(req, res) {
    const postId = req.params.postId || '';
    //validation result already checked while managing tags
    try {
        const { postTitle, postContent, postCoverURL, tags, postDescription } = req.body;
        const updatedPost = { postTitle, postContent, postCoverURL, tags, postDescription }
        for (let key of Object.keys(updatedPost)) {
            if (!updatedPost[key]) delete updatedPost[key];
        };
        console.log(updatedPost);
        if (Object.keys(updatedPost).length < 1) return res.status(400).json({ message: "no fields to update post" });
        const postData = await mongoose.models.Posts.findById(postId).catch(e => null);
        if (!postData) return res.status(400).json({ message: "Invalid PostId" });
        if (req.user.id != postData.author.toString()) return res.status(401).json({ message: "only author can update a post" });
        await mongoose.models.Posts.findByIdAndUpdate(postId, updatedPost).then(post => {
            const response = {
                previousData: post,
                updatedData: updatedPost
            }
            return res.status(200).json(response);
        }).catch(e => {
            return res.status(500).json({ message: "Couldn't update Post" });
        })

    } catch (error) {
        const { status, message } = error;
        res.status(status || 400).json({ message })
    }
}

async function listPosts(req, res) {
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 5,
        populate: {
            path: 'author',
            select: "_id userName imagePath verified"
        },
        select: '_id author views likes comments postTitle tags postDescription postCoverURL createdAt',
        sort: '-views'

    };
    let postsList = await mongoose.models.Posts.paginate({}, options).catch(_ => null)
        .then(posts => {
            return posts;
        })

    return res.status(postsList ? 200 : 500).json(postsList || { message: 'Internal database error' });

}

async function getPost(req, res) {
    const postId = req.params.postId || null;
    const postData = await mongoose.models.Posts.findOneAndUpdate({ _id: postId }, { $inc: { views: 1 } }).populate('author', ['_id', 'userName', 'imagePath', 'verified']).select("-__v -reports").catch(_ => null);
    return res.status(postData ? 200 : 400).json(postData || { message: "invalid PostId" });

}

async function searchPost(req, res) {
    const searchString = req.params.search;
    if (!searchString || (searchString.length <= 1)) return res.status(400).json({ message: "provide search with min length 2 " });
    const responseData = [];
    const searchResult = await mongoose.models.Posts.fuzzySearch(searchString).catch(e => []);
    console.log(searchResult);

    for (let i = 0; i < searchResult.length; i++) {
        const result = searchResult[i];
        const post = {};
        post._id = result.id;
        post.postTitle = result.postTitle;
        post.postContent = result.postContent;
        post.numberOfLikes = result.likes.length;
        post.numberOfComments = result.comments.length;
        post.views = result.views;
        post.tags = result.tags;
        const authorData = await mongoose.models.Users.findById(result.author).select('_id userName imagePath verified').catch(e => result.author)
        post.author = authorData;
        responseData.push(post);

    }

    return res.status(200).send(responseData);
}

async function deletePost(req, res) {
    try {
        const postId = req.params.postId || "";
        const postData = await mongoose.models.Posts.findById(postId).catch(error => null);
        if (!postData) return res.status(400).json({ message: "invalid PostId" });
        if (req.user.id == postData.author.toString()) {
            const postData = await mongoose.models.Posts.findById(postId);
            await postData.deletePost();
            res.status(200).send(postData);
        } else {
            return res.status(401).send({ msg: "Only author can delete a post" })
        }
    } catch (error) {
        return res.status(500).send({ msg: error.message || "Error occured while deleting post" });
    }

}

module.exports = { createPost, listPosts, getPost, searchPost, deletePost, updatePost };