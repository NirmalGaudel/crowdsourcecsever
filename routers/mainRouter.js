const router = require('express').Router();

router.get('/', (req, res, next) => {
    const response = {
        body: req.body,
        params: req.params
    }
    return res.status(200).json({...response});
})
module.exports = router;