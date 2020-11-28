const mongoose = require("mongoose");
const tagModel = require("../dataBase/models/tag.model");
const tagSchema = require("../dataBase/schemas/tag.schema");



async function getPopularTags(req, res) {
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: '-score',
        select: 'tag _id score'
    };
    const result = await mongoose.models.Tags.paginate({}, options).catch(e => {
        return res.status(500).json({ message: "InterNal Server Error" })
    });
    return res.send(result);
}

async function createTag(req, res) {
    const tagName = req.params.tagName || null;
    if (!tagName) return res.status(400).json({ message: "tagName not supplied" });
    const newTag = new tagModel({ _id: tagName, score: Math.floor(Math.random() * 20) });
    await newTag.save().catch(e => res.status(500).send(e)).then(d => res.status(202).send(d));
}

async function searchTag(req, res) {
    const searchString = req.params.searchString || '';
    const query = { tag: { $regex: new RegExp(searchString), $options: 'i' } };
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: '-score',
        select: 'tag _id score'
    };

    if (searchString.length < 2) return res.status(400).json({ message: "provide a searchString of at least 2 characters" });
    const searchResult = await mongoose.models.Tags.paginate(query, options).catch(e => {
        return res.status(500).json({ message: "InterNal Server Error" })
    });
    return res.send(searchResult);
}

async function getPostsByTag(req, res) {
    const formatPosts = (paginationResult) => {
        for (let i = 0; i < paginationResult.docs.length; i++) {
            const { likes, comments } = paginationResult.docs[i]._doc;
            paginationResult.docs[i]._doc.numberOfLikes = likes.length;
            paginationResult.docs[i]._doc.numberOfComments = comments.length;
            paginationResult.docs[i]._doc.isLiked = likes.includes(req.user.id);
            delete paginationResult.docs[i]._doc.likes;
            delete paginationResult.docs[i]._doc.comments;
        }
        return paginationResult;
    };
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
    const tag = req.params.tag || '';
    if (tag.length < 2) return res.status(400).json({ message: 'invalid tag' });
    const query = { tags: { $in: [tag] } }
    const posts = await mongoose.models.Posts.paginate(query, options).then(formatPosts).catch(e => []);
    return res.send(posts);
}

async function getTag(req, res) {
    const tag = req.params.tag || '';

    const tagInfo = await mongoose.models.Tags.findOne({ tag }).catch(e => null);
    if (!tagInfo) return res.status(404).json({ message: "Tag Not Found" });
    return res.status(200).json(tagInfo);
}

module.exports = { getTag, createTag, getPopularTags, searchTag, getPostsByTag }