const mongoose = require("mongoose");

async function likePost(req, res) {
    const postId = req.params.postId || null;
    if (!postId) return res.status(400).json({ success: false, message: "postId must be provided" });
    await mongoose.models.Posts.findByIdAndUpdate(postId, { $addToSet: { likes: req.user.id } }).catch(e => {
        return res.status(304).json({
            success: false,
            message: e.message
        })
    }).then(d => {
        return res.status(200).json({
            success: true,
            likes: d.likes.length || 0
        })
    })
}

async function unLikePost(req, res) {
    const postId = req.params.postId || null;
    if (!postId) return res.status(400).json({ success: false, message: "postId must be provided" });
    await mongoose.models.Posts.findByIdAndUpdate(postId, { $pull: { likes: req.user.id } }).catch(e => {
        return res.status(304).json({
            success: false,
            message: e.message
        })
    }).then(d => {
        return res.status(200).json({
            success: true,
            likes: d.likes.length || 0
        })
    })
}

async function getPostLikes(req, res) {
    const postId = req.params.postId || null;
    if (!postId) return res.status(400).json({ success: false, message: "postId must be provided" });
    const postLikes = await mongoose.models.Posts.findOne({ _id: postId }).populate('likes', ['_id', 'userName', 'imagePath']).catch(_ => []).then(d => { return d.likes });
    return res.json(postLikes);
}

async function likeComment(req, res) {
    const commentId = req.params.commentId || '';
    const isDone = await mongoose.models.Comments.findByIdAndUpdate(commentId, { $addToSet: { likes: req.user.id } }).catch(e => false);
    return res.status(isDone ? 200 : 500).json({
        success: !!isDone,
        likes: isDone.likes.length || 0
    })
}

async function unLikeComment(req, res) {
    const commentId = req.params.commentId || '';
    const isDone = await mongoose.models.Comments.findByIdAndUpdate(commentId, { $pull: { likes: req.user.id } }).catch(e => false);
    return res.status(isDone ? 200 : 500).json({
        success: !!isDone,
        likes: isDone.likes.length || 0
    })
}

async function getCommentLikes(req, res) {
    const commentId = req.params.commentId || '';
    const commentLikes = await mongoose.models.Comments.findById(commentId).populate('likes', ['_id', 'userName', 'imagePath']).catch(e => []).then(d => d.likes);
    return res.send(commentLikes);
}

module.exports = { likePost, unLikePost, getPostLikes, likeComment, unLikeComment, getCommentLikes };