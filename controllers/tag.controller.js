const mongoose = require("mongoose");
const tagModel = require("../dataBase/models/tag.model");
const tagSchema = require("../dataBase/schemas/tag.schema");



async function getPopularTags(req, res) {
    const limit = parseInt(req.query.limit) || 10
    await mongoose.models.Tags.find({}, 'tag score _id').sort({ score: -1 }).limit(limit).catch(e => {
        return res.status(500).send(e);
    }).then(async d => {
        const count = await mongoose.models.Tags.countDocuments().catch(e => 0);
        res.status(200).send({ count, data: d });

    })
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

    const regexp = new RegExp(searchString, 'i');
    if (searchString.length < 2) return res.status(400).json({ message: "provide a searchString of at least 2 characters" });
    const searchResult = await mongoose.models.Tags.paginate(query, options).catch(e => []);
    return res.send(searchResult);
}

async function getPostsByTag(req, res) {
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 5,
        populate: {
            path: 'author',
            select: "_id userName imagePath verified"
        },
        select: '_id author views likes comments postTitle postContent tags postDesciption',
        sort: '-views'

    };
    const tag = req.params.tag || '';
    if (tag.length < 2) return res.status(400).json({ message: 'invalid tag' });
    const query = { tags: { $in: [tag] } }
    const posts = await mongoose.models.Posts.paginate(query, options).catch(e => []);
    return res.send(posts);
}



module.exports = { createTag, getPopularTags, searchTag, getPostsByTag }