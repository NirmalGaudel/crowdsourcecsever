const testRouter = require('express').Router();
const { createComment, deleteComment, editComment } = require('../controllers/comment.controller');
const { createPost, listPosts, searchPost, getPost, deletePost } = require('../controllers/post.controller');
const { signUp, authenticate, getUser, listUsers, searchUsers } = require('../controllers/user.controller');
const postModel = require('../dataBase/models/post.model');
const userModel = require('../dataBase/models/user.model');
const requireAuth = require('../utils/requireAuth');
const { ValidateUserSignUP, ValidateUserSignIn, ValidateCreatePost, ValidateComment } = require('../utils/validators');


testRouter.get('/', (req, res, next) => {
    const response = { message: "This is Test API" }
    return res.status(200).json({...response });
})

//signUp and signIn

testRouter.post('/signUp', ValidateUserSignUP, signUp);
testRouter.post('/signIn', ValidateUserSignIn, authenticate)

//user

testRouter.get('/users', listUsers);
testRouter.get('/user/:targetUser', getUser);
testRouter.get('/users/:search', searchUsers);

//post

testRouter.post('/posts', [requireAuth, ValidateCreatePost], createPost);
testRouter.get('/posts', listPosts);
testRouter.get('/post/:postId', getPost);
testRouter.get('/posts/:search', searchPost);
testRouter.delete('/post/:postId', requireAuth, deletePost)

//comment

testRouter.post('/post/:postId/comment', [requireAuth, ValidateComment], createComment);
testRouter.put('/comment/:commentId', [requireAuth, ValidateComment], editComment)
testRouter.delete('/comment/:commentId', requireAuth, deleteComment);

module.exports = testRouter;