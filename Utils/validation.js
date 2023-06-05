const { celebrate, Joi } = require('celebrate');

const regexp = require('./Regexp');

const signUpValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(regexp),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const sigInValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const updateUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
});
const updateAvatarValidation = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(regexp),
  }),
});

const createCardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().regex(regexp),
  }),
});

const getUserIdValidation = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
});

const cardIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
});

module.exports = {
  signUpValidation,
  sigInValidation,
  updateUserValidation,
  updateAvatarValidation,
  createCardValidation,
  getUserIdValidation,
  cardIdValidation,
};
