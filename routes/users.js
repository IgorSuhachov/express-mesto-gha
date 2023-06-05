const router = require('express').Router();

const { getUser, getUserById, updateProfile, updateAvatar, getMe } = require('../controllers/users');
const { authorization } = require('../middlewares/auth');

router.get('/', authorization, getUser);
router.get('/me', authorization, getMe);
router.get('/:userId', authorization, getUserById);
router.patch('/me', authorization, updateProfile);
router.patch('/me/avatar', authorization, updateAvatar);

module.exports = router;
