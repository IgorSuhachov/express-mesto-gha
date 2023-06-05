const router = require('express').Router();

const {
  getUser, getUserById, updateProfile, updateAvatar, getMe,
} = require('../controllers/users');
const { authorization } = require('../middlewares/auth');
const { updateUserValidation, updateAvatarValidation, getUserIdValidation } = require('../Utils/validation');

router.get('/', authorization, getUser);
router.get('/me', authorization, getMe);
router.get('/:userId', authorization, getUserIdValidation, getUserById);
router.patch('/me', authorization, updateUserValidation, updateProfile);
router.patch('/me/avatar', authorization, updateAvatarValidation, updateAvatar);

module.exports = router;
