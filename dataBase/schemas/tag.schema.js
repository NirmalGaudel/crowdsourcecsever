const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        minlength: [2, 'Tag must have more than 2 characters'],
        maxlength: [32, 'Tag must have less than 32 characters']
    },
    score: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = tagSchema