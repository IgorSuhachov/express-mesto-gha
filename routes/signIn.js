const router = require('express').Router();
const { login } = require('../controllers/users');

router.post('/signin', login);

module.exports = router;
