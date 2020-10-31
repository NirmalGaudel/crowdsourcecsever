const mongoose = require("mongoose");
const tagSchema = require("../schemas/tag.schema");

tagSchema.index({ tag: 'text' }, { name: 'tagIndex', weights: { tag: 10 } });

const tagModel = mongoose.model("Tags", tagSchema);
module.exports = tagModel;