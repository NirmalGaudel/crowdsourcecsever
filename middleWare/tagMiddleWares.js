const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

async function manageTagsForCreatePost(req, res, next) {
    const result = validationResult(req);
    if (result.errors.length > 0) return res.status(400).json(result.errors);
    const tags = req.body.tags;
    console.log(tags);
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
    next();
}
async function manageTagsForDeletePost(req, res, next) {
    next();
}
module.exports = { manageTagsForCreatePost, manageTagsForUpdatePost, manageTagsForDeletePost }