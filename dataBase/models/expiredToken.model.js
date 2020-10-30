const mongoose = require("mongoose");

const invalidTokenSchema = new mongoose.Schema({
    tokenDate: {
        type: Date,
        required: true,
        unique: true,
        expires: 86400
    },
    token: {
        type: String,
        required: true,
        unique: true
    }

}, {
    timestamps: false,
    versionKey: 'version'
});


invalidTokenSchema.index({ "expire_at": 1 }, { expireAfterSeconds: 86400 });
const invalidTokenModel = mongoose.model("InvalidTokens", invalidTokenSchema);
module.exports = invalidTokenModel;