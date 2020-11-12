const { body } = require("express-validator");
const mongoose = require("mongoose")

const ValidateUserSignUP = [
    body('userName').notEmpty().withMessage("userName is required")
    .isLength({ min: 3 }).withMessage("userName must have more than 3 characters")
    .isLength({ max: 32 }).withMessage("userName must have less than 32 characters")
    .not().isEmail().withMessage("userName must not be an email")
    .custom(async userName => {
        if (!userName) { return Promise.reject('userName is required') };

        if (mongoose.isValidObjectId(userName)) return Promise.reject('userName not valid');
        return mongoose.models.Users.findOne({ userName }).then(user => {
            if (user) {
                return Promise.reject('userName already in use');
            }
        });
    }),
    body('email').optional().isEmail().withMessage('email is invalid')
    .normalizeEmail().isLength({ max: 128 }).withMessage("email must have less than 128 characters")
    .custom(email => {
        return mongoose.models.Users.findOne({ email }).then((err, user) => {
            if (err || user) {
                return Promise.reject('E-mail already in use');
            }
        });
    }),
    body('firstName').notEmpty().withMessage("firstName is required")
    .isLength({ min: 3 }).withMessage("firstName must have more than 3 characters")
    .isLength({ max: 20 }).withMessage("firstName must have less than 20 characters"),
    body('middleName').optional()
    .isLength({ min: 3 }).withMessage("middleName must have more than 3 characters")
    .isLength({ max: 20 }).withMessage("middleName must have less than 20 characters"),
    body('lastName').notEmpty().withMessage("lastName is required")
    .isLength({ min: 3 }).withMessage("lastName must have more than 3 characters")
    .isLength({ max: 20 }).withMessage("lastName must have less than 20 characters"),
    body('password').notEmpty().withMessage("password is required")
    .matches(/(?=.*[A-Z])/).withMessage("password requires at least one uppurcase letter")
    .matches(/(?=.*[a-z])/).withMessage("password requires at least one lowercase letter")
    .matches(/(?=.*\d)/).withMessage("password requires at least one number")
    .isLength({ min: 6 })
    .withMessage("Password must have at least 6 characters")
    .isLength({ max: 20 })
    .withMessage("Password can contain max 20 characters")
    .custom((password, { req }) => (password === req.body.confirmPassword))
    .withMessage("confirmPassword don't match with password"),
    body('gender').optional().isIn(['M', 'F', 'O']).withMessage("gender must be one of ['M','F','O']"),
    body('bio').optional().isLength({ max: 200 }).withMessage("bio must have less than 200 characters"),
    body('imagePath').notEmpty().withMessage('imagePath is required').custom(imagePath => {
        try {
            const ImageName = imagePath.split('.')[0];
            const ImageNumber = parseInt(ImageName.slice(11));
            if (ImageNumber > 0 && ImageNumber < 51) {
                return true;
            } else {
                throw new Error("Invalid ImagePath")
            }
        } catch (error) {
            Promise.reject("Invalid imagePath");
        }
    })
]

const ValidateUserSignIn = [
    body('userName').notEmpty().withMessage("userName is empty"),
    body('password').notEmpty().withMessage("password is empty")
]

const ValidateCreatePost = [
    body('postTitle').notEmpty().withMessage("postTitle is required")
    .isLength({ min: 3 }).withMessage('postTitle must have more than 3 characters')
    .isLength({ max: 100 }).withMessage("postTitle must have less than 100 characters"),
    body('postContent').notEmpty().withMessage('postContent is required')
    .isLength({ min: 20 }).withMessage('postContent must have more than 20 characters')
    .isLength({ max: 2000 }).withMessage('postContent must have less than 2000 characters'),
    body('postDescription').notEmpty().withMessage('postDescription is required')
    .isLength({ min: 20 }).withMessage('postDescription must have more than 20 characters')
    .isLength({ max: 200 }).withMessage('postDescription must have less than 200 characters'),
    body('tags').notEmpty().withMessage('post requires tags').toArray().isArray({ min: 5, max: 10 }).withMessage('tags must be an array of min length 5 and max length 10')
    .custom(tags => {
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            const taglength = tag.length;
            if (taglength < 2) throw new Error("a tag must have more than 2 characters" + `, but length of \'${tags[i]}\' is ${taglength} characters`);
            if (taglength > 32) throw new Error("a tag must have less than 32 characters" + `, but length of \'${tags[i]}\' is ${taglength} characters`);
            const isInArray = (tags.lastIndexOf(tag) != i);
            if (isInArray) throw new Error(`duplicate values are not allowed`);
        }
        return true;
    })
]

const ValidateUpdatePost = [
    body('postTitle').optional()
    .isLength({ min: 3 }).withMessage('postTitle must have more than 3 characters')
    .isLength({ max: 100 }).withMessage("postTitle must have less than 100 characters"),
    body('postContent').optional()
    .isLength({ min: 20 }).withMessage('postContent must have more than 20 characters')
    .isLength({ max: 2000 }).withMessage('postContent must have less than 2000 characters'),
    body('postDescription').optional()
    .isLength({ min: 20 }).withMessage('postDescription must have more than 20 characters')
    .isLength({ max: 200 }).withMessage('postDescription must have less than 200 characters'),
    body('tags').optional().toArray().isArray({ min: 5, max: 10 }).withMessage('tags must be an array of min length 5 and max length 10')
    .custom(tags => {
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            const taglength = tag.length;
            if (taglength < 2) throw new Error("a tag must have more than 2 characters" + `, but length of \'${tags[i]}\' is ${taglength} characters`);
            if (taglength > 32) throw new Error("a tag must have less than 32 characters" + `, but length of \'${tags[i]}\' is ${taglength} characters`);
            const isInArray = (tags.lastIndexOf(tag) != i);
            if (isInArray) throw new Error(`duplicate values are not allowed`);
        }
        return true;
    })
]

const ValidateComment = [
    body('commentContent').not().isEmpty().withMessage("comment requires commentContent")
    .isLength({ max: 2000 }).withMessage("comment must have less than 2000 characters")
]

const ValidateUpdateUser = [
    body('userName').optional()
    .isLength({ min: 3 }).withMessage("userName must have more than 3 characters")
    .isLength({ max: 32 }).withMessage("userName must have less than 32 characters")
    .not().isEmail().withMessage("userName must not be an email")
    .custom(async userName => {
        if (!userName) { return Promise.reject('userName is required') };

        if (mongoose.isValidObjectId(userName)) return Promise.reject('userName not valid');
        return mongoose.models.Users.findOne({ userName }).then(user => {
            if (user) {
                return Promise.reject('userName already in use');
            }
        });
    }),
    body('email').optional().isEmail().withMessage('email is invalid')
    .normalizeEmail().isLength({ max: 128 }).withMessage("email must have less than 128 characters")
    .custom(email => {
        return mongoose.models.Users.findOne({ email }).then((err, user) => {
            if (err || user) {
                return Promise.reject('E-mail already in use');
            }
        });
    }),
    body('firstName').optional()
    .isLength({ min: 3 }).withMessage("firstName must have more than 3 characters")
    .isLength({ max: 20 }).withMessage("firstName must have less than 20 characters"),
    body('middleName').optional()
    .isLength({ min: 3 }).withMessage("middleName must have more than 3 characters")
    .isLength({ max: 20 }).withMessage("middleName must have less than 20 characters"),
    body('lastName').optional()
    .isLength({ min: 3 }).withMessage("lastName must have more than 3 characters")
    .isLength({ max: 20 }).withMessage("lastName must have less than 20 characters"),
    body('gender').optional().isIn(['M', 'F', 'O']).withMessage("gender must be one of ['M','F','O']"),
    body('bio').optional().isLength({ max: 200 }).withMessage("bio must have less than 200 characters"),

    body('intrests').optional().custom(intrests => {
        return Promise.reject("Feature not yet been implimented")
    })

]

const ValidatePasswordChange = [
    body('password').notEmpty().withMessage("password is required")
    .matches(/(?=.*[A-Z])/).withMessage("password requires at least one uppurcase letter")
    .matches(/(?=.*[a-z])/).withMessage("password requires at least one lowercase letter")
    .matches(/(?=.*\d)/).withMessage("password requires at least one number")
    .isLength({ min: 6 })
    .withMessage("Password must have at least 6 characters")
    .isLength({ max: 20 })
    .withMessage("Password can contain max 20 characters")
    .custom((password, { req }) => (password === req.body.confirmPassword))
    .withMessage("confirmPassword don't match with password")
]


module.exports = { ValidateUserSignUP, ValidateUpdateUser, ValidateUserSignIn, ValidateCreatePost, ValidateUpdatePost, ValidateComment, ValidatePasswordChange };