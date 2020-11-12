const mongoose = require("mongoose");
const tagSchema = require("../schemas/tag.schema");
const mongoosePaginate = require("mongoose-paginate-v2");

tagSchema.index({ tag: 'text' }, { name: 'tagIndex', weights: { tag: 10 } });
tagSchema.plugin(mongoosePaginate);

const tagModel = mongoose.model("Tags", tagSchema);
module.exports = tagModel;