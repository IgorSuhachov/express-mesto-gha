const router = require('express').Router();
const { createUser } = require('../controllers/users');

router.post('/signup', createUser);
module.exports = router;
