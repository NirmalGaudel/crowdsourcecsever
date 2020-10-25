const { validationResult } = require("express-validator");
const postModel = require("../dataBase/models/post.model");
const { post } = require("../dataBase/schemas/post.schema");
const mongoose = require("../dataBase/utils/dbConnect");

async function getPostById(postId) {
    const errorMsg = { message: "invalid PostId" };
    return new Promise(async(resolve, reject) => {
        if (!mongoose.isValidObjectId(postId)) {
            return reject(errorMsg);
        };
        const postData = await mongoose.models.Posts.findById(postId).catch(e => null);
        if (!postData) return reject({ message: "post not found" })
        return resolve(postData);
    })
}

async function createPost(req, res) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(400).json(result.errors);
    try {
        const { postTitle, postContent, isPublic, postImagesPath, tags } = req.body;
        const newPost = new postModel({ author: req.user.id, postTitle, postContent, isPublic, postImagesPath, tags });
        const savedPost = await newPost.save();
        // delete savedPost.__v;
        // delete savedPost.createdAt;
        return res.status(201).json(savedPost);
    } catch (error) {
        const { status, message } = error;
        res.status(status || 400).json({ message })
    }
}

async function listPosts(req, res) {
    const options = {};
    try {
        const posts = await mongoose.models.Posts.find(options).populate('author', ['userName', 'imagePath', 'verified']);
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
}

async function getPost(req, res) {
    const postId = req.params.postId;
    let status = 200;
    if (!mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ message: "invalid PostId" });
    };
    const result = await mongoose.models.Posts.findById(postId).catch(_ => {
        status = 500;
        return null
    });
    if (result == null && status == 200) status = 404;
    return res.status(status || 200).send(result);
}

async function searchPost(req, res) {
    const searchString = req.params.search;
    if (!searchString || (searchString.length <= 1)) return res.status(400).json({ message: "provide search with min length 2 " });
    let responseData = [];
    try {
        const reg = new RegExp(`/^${searchString}/`, "i");
        responseData = await mongoose.models.Posts.find({ $text: { $search: reg } }, { score: { $meta: 'textScore' } }, ).sort({ score: { $meta: "textScore" } })
        res.send(responseData);
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
}

async function deletePost(req, res) {
    try {
        const postId = req.params.postId;
        const postData = await getPostById(postId);
        if (req.user.id == postData.author.toString()) {
            const postData = await mongoose.models.Posts.findById(postId);
            await postData.deletePost();
            res.status(200).send(postData);
        } else {
            return res.send({ msg: "Only author can delete a post" })
        }
    } catch (error) {
        return res.status(500).send({ msg: error.message || "Error occured while deleting post" });
    }

}

module.exports = { createPost, listPosts, getPost, searchPost, deletePost }