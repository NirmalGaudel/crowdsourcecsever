const mainRouter = require('express').Router();
const { createComment, deleteComment, editComment, getpostComments, getComment } = require('../controllers/comment.controller');
const { likePost, getPostLikes, unLikePost, likeComment, unLikeComment, getCommentLikes } = require('../controllers/like.controller');
const { createPost, listPosts, searchPost, getPost, deletePost } = require('../controllers/post.controller');
const { getPopularTags, searchTag, getPostsByTag } = require('../controllers/tag.controller');
const { getUser, listUsers, searchUsers, editUserDetails, deleteUser, getUserPosts } = require('../controllers/user.controller');
const { manageTagsForCreatePost, manageTagsForDeletePost } = require('../middleWare/tagMiddleWares');
const { ValidateCreatePost, ValidateComment, ValidateUpdateUser } = require('../middleWare/validators');

mainRouter.get('/', (req, res, next) => {
    const response = { message: "This is Test API" };
    return res.status(200).json({...response });
});


//user

mainRouter.get('/users', listUsers);
mainRouter.get('/user/:targetUser', getUser);
mainRouter.get('/users/:search', searchUsers);
mainRouter.get('/user/:userId/posts', getUserPosts)
mainRouter.put('/user/:userId', ValidateUpdateUser, editUserDetails);
mainRouter.delete('/user/:userId', deleteUser);


//post

mainRouter.post('/posts', [ValidateCreatePost, manageTagsForCreatePost], createPost);
mainRouter.get('/posts', listPosts);
mainRouter.get('/post/:postId', getPost);
mainRouter.get('/posts/:search', searchPost);
mainRouter.delete('/post/:postId', manageTagsForDeletePost, deletePost)

//comment

mainRouter.get('/post/:postId/comments', getpostComments);
mainRouter.post('/post/:postId/comment', [ValidateComment], createComment);
mainRouter.get('/comment/:commentId', getComment);
mainRouter.put('/comment/:commentId', [ValidateComment], editComment)
mainRouter.delete('/comment/:commentId', deleteComment);


//like

mainRouter.post('/post/:postId/like', likePost)
mainRouter.post('/post/:postId/unlike', unLikePost)
mainRouter.get('/post/:postId/likes', getPostLikes)
mainRouter.post("/comment/:commentId/like", likeComment)
mainRouter.post("/comment/:commentId/unlike", unLikeComment)
mainRouter.get("/comment/:commentId/likes", getCommentLikes)

//tags

mainRouter.get("/tags", getPopularTags);
mainRouter.get("/tags/:searchString", searchTag);
mainRouter.get('/tag/:tag', getPostsByTag);

module.exports = mainRouter;