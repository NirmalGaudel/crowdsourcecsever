const mongoose = require("mongoose")
const postSchema = require("../schemas/post.schema")

postSchema.path('author').validate(async(author) => {
    const UserIDCount = await mongoose.models.Users.countDocuments({ _id: author }).catch(e => { return 0; });
    return !!UserIDCount;
}, 'authorUserID is not valid');

postSchema.post('save', async function() {
    try {
        await mongoose.models.Users.findByIdAndUpdate(this.author, { $push: { posts: this._id } });
    } catch (error) {
        await this.delete();
        const e = new Error("Could Not Post");
        e.status = 500;
        throw e;
    }

})

postSchema.index({
    postTitle: 'text',
    postContent: 'text'
}, {
    name: 'PostSearch index',
    weights: {
        postTitle: 15,
        postContent: 10
    }
});


postSchema.methods.toggleLike = async function(userID) {
    let like = 1;
    if (this.likes.includes(userID)) {

        this.likes = this.likes.filter(uid => userID != uid);
        like = -1;
    } else {
        this.likes.push(userID);
    }
    await this.save();
    return like;
}



postSchema.methods.deletePost = async function() {
    try {
        //delete all comments
        const toBeDeleted = await mongoose.models.Comments.find({ postId: this._id });
        toBeDeleted.forEach(async comment => {
            await comment.deleteComment();
        });
        //delete from author's posts
        await mongoose.models.Users.findByIdAndUpdate(this.author, { $pull: { posts: this._id } });
        //delete actual post
        this.delete();
    } catch (error) {
        throw new Error("could not delete post");
    }
}

const postModel = mongoose.model("Posts", postSchema);
module.exports = postModel;