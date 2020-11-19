const multer = require("multer");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, "./uploads/"),
        filename: (req, file, cb) => {

            let extension = file.mimetype.split("/")[1];
            if (extension == 'svg+xml') { extension = 'svg' };
            cb(null, req.user.id + '-' + Date.now() + '.' + extension);
        }
    }),
    fileFilter: (req, file, cb) => cb(null, (file.mimetype.split('/')[0] === 'image')),
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

singleImageStore = fieldName => (req, res, next) => (upload.any(fieldName))(req, res, () => {
    next();
});

module.exports = { singleImageStore }