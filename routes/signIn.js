const router = require('express').Router();
const { login } = require('../controllers/users');
const { sigInValidation } = require('../Utils/validation');

router.post('/signin', sigInValidation, login);

module.exports = router;
