const { signUp, authenticate, validateToken, logOut, changePassword } = require('../controllers/user.controller');
const requireAuth = require('../middleWare/requireAuth');
const { ValidateUserSignIn, ValidateUserSignUP, ValidatePasswordChange } = require('../middleWare/validators');

const authRouter = require('express').Router();

authRouter.post('/signUp', ValidateUserSignUP, signUp);
authRouter.post('/signIn', ValidateUserSignIn, authenticate)
authRouter.put('/password', [ValidatePasswordChange, requireAuth], changePassword)

authRouter.post('/verify', requireAuth, validateToken);
authRouter.post('/logOut', requireAuth, logOut);


module.exports = authRouter;