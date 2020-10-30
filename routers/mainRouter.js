// const router = require('express').Router();

// router.get('/', (req, res, next) => {
//     const response = {
//         body: req.body,
//         params: req.params
//     }
//     return res.status(200).json({...response});
// })
// module.exports = router;



const mainRouter = require('express').Router();
const { createComment, deleteComment, editComment } = require('../controllers/comment.controller');
const { likePost, getPostLikes, unLikePost } = require('../controllers/like.controller');
const { createPost, listPosts, searchPost, getPost, deletePost } = require('../controllers/post.controller');
const { getUser, listUsers, searchUsers, editUserDetails, deleteUser } = require('../controllers/user.controller');
const { ValidateCreatePost, ValidateComment, ValidateUpdateUser } = require('../utils/validators');

mainRouter.get('/', (req, res, next) => {
    const response = { message: "This is Test API" };
    return res.status(200).json({...response });
});


//user

mainRouter.get('/users', listUsers);
mainRouter.get('/user/:targetUser', getUser);
mainRouter.get('/users/:search', searchUsers);

mainRouter.put('/user/:userId', ValidateUpdateUser, editUserDetails);
mainRouter.delete('/user/:userId', deleteUser);


//post

mainRouter.post('/posts', [ValidateCreatePost], createPost);
mainRouter.get('/posts', listPosts);
mainRouter.get('/post/:postId', getPost);
mainRouter.get('/posts/:search', searchPost);
mainRouter.delete('/post/:postId', deletePost)

//comment

mainRouter.post('/post/:postId/comment', [ValidateComment], createComment);
mainRouter.put('/comment/:commentId', [ValidateComment], editComment)
mainRouter.delete('/comment/:commentId', deleteComment);


//like

mainRouter.post('/post/:postId/like', likePost)
mainRouter.post('/post/:postId/unlike', unLikePost)
mainRouter.get('/post/:postId/likes', getPostLikes)

module.exports = mainRouter;