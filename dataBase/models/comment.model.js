const mongoose = require("mongoose");
const commentSchema = require("../schemas/comment.schema");
const mongoosePaginate = require("mongoose-paginate-v2");


commentSchema.plugin(mongoosePaginate);

commentSchema.path('author').validate(async(author) => {
    const UserIDCount = await mongoose.models.Users.countDocuments({ _id: author }).catch(e => { return 0; });
    return !!UserIDCount;
}, 'author is not valid');

commentSchema.path('postId').validate(async(postId) => {
    const postCount = await mongoose.models.Posts.countDocuments({ _id: postId }).catch(e => 0);
    return !!postCount;
}, 'postId is not valid');

commentSchema.post('save', async function() {
    try {
        let isSavedOnPost = false;
        await mongoose.models.Posts.findByIdAndUpdate(this.postId, { $push: { comments: this._id } });
        isSavedOnPost = true;
        await mongoose.models.Users.findByIdAndUpdate(this.author, { $push: { comments: this._id } });

    } catch (error) {
        if (isSavedOnPost) {
            mongoose.models.Posts.findByIdAndUpdate(this.postId, { $pull: comments });
        };
        this.delete();
        throw new Error("Could not make a comment");
    }
});


commentSchema.methods.toggleLike = async function(userId) {
    let like = 1;
    if (this.likes.includes(userId)) {
        this.likes = this.likes.filter(uid => userID != uid);
        like = -1;
    } else {
        this.likes.push(userId);
    }
    await this.save();
    return like;
}

commentSchema.methods.deleteComment = async function() {
    try {
        //delete from users comments
        await mongoose.models.Users.findByIdAndUpdate(this.author, { $pull: { comments: this._id } });
        //delete comment from the post
        await mongoose.models.Posts.findByIdAndUpdate(this.postId, { $pull: { comments: this._id } });
        //delete actual comment
        await this.delete();
    } catch (error) {
        throw new Error('coludn\'t delete the comment ')
    }
}


const commentModel = mongoose.model("Comments", commentSchema);
module.exports = commentModel;