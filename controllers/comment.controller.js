const { validationResult } = require("express-validator");
const commentModel = require("../dataBase/models/comment.model");
const mongoose = require("mongoose");

async function createComment(req, res) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(400).json(result.errors);
    const postId = req.params.postId;
    if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ msg: "invalid postId" });
    const postCount = await mongoose.models.Posts.countDocuments({ _id: postId }).catch(e => 0);
    if (!postCount) return res.status(400).json({ msg: "invalid postId" });
    const newComment = new commentModel({ author: req.user.id, commentContent: req.body.commentContent, postId });
    newComment.save().then(comment => {
        const { _id, author, postId, commentContent, createdAt } = comment;
        return res.status(201).json({ _id, author, postId, commentContent, createdAt });
    })
}

async function getComment(req, res) {
    const commentId = req.params.commentId || '';
    const comment = await mongoose.models.Comments.findById(commentId).catch(e => null);
    res.status(comment ? 200 : 400).send(comment || { message: "comment not found" });

}

async function deleteComment(req, res) {
    try {

        const cmtId = req.params.commentId;
        if (!mongoose.isValidObjectId(cmtId)) return res.status(400).send({ msg: "invalid commentId" });
        const commentData = await mongoose.models.Comments.findById(cmtId).catch(_ => null);
        if (!commentData) return res.status(404).send({ msg: "comment not found" });
        const postData = await mongoose.models.Posts.findById(commentData.postId);
        if ((req.user.id == commentData.author) || (req.user.id == postData.author)) {
            await commentData.deleteComment();
            return res.status(200).send(commentData);
        } else {
            return res.status(203).send({ msg: "Only the author can delete this comment" })
        }
    } catch (error) {
        return res.status(500).send({ msg: error.message || "couldn\'t delete the comment" })
    }
}

async function editComment(req, res) {
    try {
        const cmtId = req.params.commentId;
        const comment = req.body.commentContent;
        if (!comment) return res.status(400).send({ msg: "commentContent is required for a comment" });
        if (!mongoose.isValidObjectId(cmtId)) return res.status(400).send({ msg: "invalid commentId" });
        const commentData = await mongoose.models.Comments.findById(cmtId).catch(_ => null);
        if (!commentData) return res.status(404).send({ msg: "comment not found" });
        if (req.user.id == commentData.author) {
            await mongoose.models.Comments.findByIdAndUpdate(commentData._id, { commentContent: req.body.commentContent });
            return res.status(200).json({ msg: "successfully updated", commentId: cmtId, previous: commentData.commentContent, now: req.body.commentContent });
        }
    } catch (error) {
        return res.status(500).json({ msg: "couldn\'t update comment" });
    }
}

async function getpostComments(req, res) {
    const postId = req.params.postId || '';
    const comments = await mongoose.models.Comments.find({ postId }).select("-__v").populate('author', ['_id', 'userName', "imagePath", "verified"]).catch(e => []);
    res.send(comments)
}

module.exports = { createComment, getComment, deleteComment, editComment, getpostComments };