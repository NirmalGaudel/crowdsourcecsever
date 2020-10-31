const mongoose = require('mongoose');
const { restart } = require('nodemon');
const { post } = require('../schemas/user.schema');
const userSchema = require('../schemas/user.schema');
const mongooseFuzzySearching = require('mongoose-fuzzy-searching');

userSchema.plugin(mongooseFuzzySearching, {
    fields: [
        { name: "firstName" },
        { name: "middleName", minSize: 2, prefixOnly: true, wight: 2 },
        { name: "lastName", minSize: 2, prefixOnly: true, weight: 3 },
        { name: "userName", minSize: 2, weight: 6 }
    ]
});

userSchema.virtual("fullName").get(function() {
    const midName = (this.middleName) ? this.middleName : ' ';
    return this.firstName + midName + this.lastName;
});

userSchema.path('email').validate(async(email) => {
    const emailCount = await mongoose.models.Users.countDocuments({ email });
    return !emailCount;
}, 'Email already exists');

userSchema.path('userName').validate(async(userName) => {
    const userNameCount = await mongoose.models.Users.countDocuments({ userName });
    return !userNameCount;
}, 'UserName already exists');

userSchema.methods.deleteUser = async function() {
    const undeletedPosts = [];
    this.posts.forEach(async postId => {
        const postData = await mongoose.models.Posts.findById(postId).catch(e => null);
        if (postData) {
            try {
                await postData.deletePost();
            } catch (e) {
                undeletedPosts.push(postId);
            }
        }
    });
    try {
        await this.delete();
        if (undeletedPosts.length > 0) {
            console.log("Couldn't delete posts", undeletedPosts);
            return { status: 206, message: "Deleted user " + this._id + " but remainig some posts", undeletedPosts };

        } else {

            return { status: 200, message: "Deleted user " + this._id }
        }
    } catch (err) {
        return { status: 500, message: "couldn\'t delete user " + this._id }
    }


}

const userModel = mongoose.model("Users", userSchema);
module.exports = userModel;