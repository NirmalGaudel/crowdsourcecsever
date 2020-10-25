const mongoose = require('mongoose');
const userSchema = require('../schemas/user.schema');

userSchema.virtual("fullName").get(function () {
    const midName = (this.middleName) ? this.middleName : ' ';
    return this.firstName + midName + this.lastName;
});

userSchema.path('email').validate(async (email) => {
    const emailCount = await mongoose.models.Users.countDocuments({ email });
    return !emailCount;
}, 'Email already exists');

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();
    console.log("Encrypting Password");
    // Encript Password Here
    // this.password = await bcrypt.hash(this.password, 10)
    return next();
});

userSchema.methods.checkPassword = async function (password) {
    const result = await bcrypt.compare(password, this.password);
    return result;
}

userSchema.methods.togglePostLike = async function (postID) {
    console.log(userSchema.methods );
    return new Promise(async (resolve, reject) => {
        const postDetail = await mongoose.models.Posts.findById(postID).catch(_ => null);
        if (!postDetail) return reject("Post Not Found");
        let postLikes = postDetail.likes;
        let userLikes = this.likes;
        const didLiked = postLikes.includes(this._id);
        if (!didLiked) {
            postLikes.push(this._id);
            userLikes.push(postID);
            await mongoose.models.Users.findByIdAndUpdate(this._id, {
                likes: userLikes
            }).then(async _ => {
                await mongoose.models.Posts.findByIdAndUpdate(postID, {
                    likes: postLikes
                }).then(_ => resolve("Post Liked SuccessFully")).catch(async _ => {
                    //remove postID from user likes
                    userLikes.pop();
                    await mongoose.models.Users.findByIdAndUpdate(this._id, {
                        likes: userLikes
                    }).then(_ => true).catch(_ => false);
                    reject("Post cannot be liked");
                })
            }).catch(e => reject("post cannot be liked by this user"));
        } else {
            postLikes = postLikes.filter(id => id != `${this._id}`);
            userLikes = userLikes.filter(pid => pid != postID);
            await mongoose.models.Users.findByIdAndUpdate(this._id, {
                likes: userLikes
            }).then(async _ => {
                await mongoose.models.Posts.findByIdAndUpdate(postID, {
                    likes: postLikes
                }).then(_ => resolve("Post Unliked SuccessFully")).catch(async _ => {
                    //add postID to user likes
                    userLikes.push(postID);
                    await mongoose.models.Users.findByIdAndUpdate(this._id, {
                        likes: userLikes
                    }).then(_ => true).catch(_ => false);
                    reject("Post could not be unliked");
                })
            }).catch(e => reject("post couldnot be unliked by this user"));
        }
    })
}



userSchema.methods.commentPost = async function (commentPayload) {
    let taskResult = false;
    commentPayload.userID = this._id;
    const postDetail = await mongoose.models.Posts.findById(commentPayload.postID).catch(e => false);
    if (!postDetail) return taskResult;
    const savedComment = await new commentModel(commentPayload).save().catch(e => false);
    postDetail.comments.push(savedComment._id);
    taskResult = await mongoose.models.Posts.findByIdAndUpdate(commentPayload.postID, {
        comments: postDetail.comments
    }).then(d => true).catch(e => flase);
    return taskResult;
}

const userModel = mongoose.model("Users", userSchema);
module.exports = userModel;
