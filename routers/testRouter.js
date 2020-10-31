const testRouter = require('express').Router();
const { createComment, deleteComment, editComment } = require('../controllers/comment.controller');
const { likePost, getPostLikes, unLikePost } = require('../controllers/like.controller');
const { createPost, listPosts, searchPost, getPost, deletePost } = require('../controllers/post.controller');
const { getPopularTags, createTag, searchTag, getPostsByTag } = require('../controllers/tag.controller');
const { getUser, listUsers, searchUsers, editUserDetails, deleteUser } = require('../controllers/user.controller');
const { ValidateCreatePost, ValidateComment, ValidateUpdateUser } = require('../middleWare/validators');

testRouter.get('/', (req, res, next) => {
    const response = { message: "This is Test API" };
    return res.status(200).json({...response });
});


// //user

// testRouter.get('/users', listUsers);
// testRouter.get('/user/:targetUser', getUser);
// testRouter.get('/users/:search', searchUsers);

// testRouter.put('/user/:userId', ValidateUpdateUser, editUserDetails);
// testRouter.delete('/user/:userId', deleteUser);


// //post

// testRouter.post('/posts', [ValidateCreatePost], createPost);
// testRouter.get('/posts', listPosts);
// testRouter.get('/post/:postId', getPost);
// testRouter.get('/posts/:search', searchPost);
// testRouter.delete('/post/:postId', deletePost)

// //comment

// testRouter.post('/post/:postId/comment', [ValidateComment], createComment);
// testRouter.put('/comment/:commentId', [ValidateComment], editComment)
// testRouter.delete('/comment/:commentId', deleteComment);


// //like

// testRouter.post('/post/:postId/like', likePost)
// testRouter.post('/post/:postId/unlike', unLikePost)
// testRouter.get('/post/:postId/likes', getPostLikes)

//tags

testRouter.get("/tags", getPopularTags);
testRouter.get("/tags/:searchString", searchTag);
testRouter.get('/posts/:tag', getPostsByTag);
testRouter.post("/tags/:tagName", createTag);

module.exports = testRouter;