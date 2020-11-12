const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

async function manageTagsForCreatePost(req, res, next) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(412).json(result.errors);
    const tags = req.body.tags;
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    try {
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            await mongoose.models.Tags.findOneAndUpdate({ tag }, { $inc: { score: 1 } }, options);
        }
    } catch (err) {
        return res.status(500).send("couldn\'t update tags.");
    }
    next();
}
async function manageTagsForUpdatePost(req, res, next) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(412).json(result.errors);
    const postId = req.params.postId || '';
    const tags = req.body.tags || [];
    if (tags.length > 0) {
        const postData = await mongoose.models.Posts.findById(postId).select("author tags").catch(e => null); //also checks valid postId
        if (!postData) return res.status(400).json({ message: "invalid postId" }); //if postId is invalid

        console.log({ userId: req.user.id, postAuthor: postData });
        if (req.user.id != postData.author) return res.status(401).json({ message: "only the author can edit a post" });
        const previousTags = postData.tags;
        //find new tag and excluded tags
        const newTags = tags.filter(tag => !previousTags.includes(tag));
        const excludedTags = previousTags.filter(tag => !tags.includes(tag));
        try {
            //add one score or create a tag on new tags
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };
            newTags.forEach(async tag => {
                await mongoose.models.Tags.findOneAndUpdate({ tag }, { $inc: { score: 1 } }, options);
            });
            //subtract one score from each excludedTags
            await mongoose.models.Tags.updateMany({ tag: { $in: excludedTags } }, { $inc: { score: -1 } });
        } catch (err) {
            return res.status(500).json({ message: err.message || "Internal Server Error" });
        }
        next();

    } else {
        next();
    }
}
async function manageTagsForDeletePost(req, res, next) {

    //this functionality is implimmented when post is deleted
    next();
}
module.exports = { manageTagsForCreatePost, manageTagsForUpdatePost, manageTagsForDeletePost }