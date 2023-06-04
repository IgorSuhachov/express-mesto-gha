const router = require('express').Router();
const { celebrate, Segments, Joi } = require('celebrate');

const { getUser, getUserById, createUser, updateProfile, updateAvatar, getMe, login } = require('../controllers/users');
const { authorization } = require('../middlewares/auth');

router.get('/', getUser);
router.get('/me', authorization, getMe);
router.get('/:userId', getUserById);
router.post('/', createUser);
router.post('/signin', login);
router.post(
  '/signup',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      avatar: Joi.string(),
    },
  }),
  createUser
);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
