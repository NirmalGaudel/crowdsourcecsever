const mongoose = require("../dataBase/utils/dbConnect");

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

module.exports = { likePost, unLikePost, getPostLikes };