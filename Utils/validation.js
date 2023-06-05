const { celebrate, Joi } = require('celebrate');

const signUpValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().uri(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
});

const sigInValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
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
    avatar: Joi.string().uri(),
  }),
});

const createCardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    link: Joi.string().required().uri(),
  }),
});

module.exports = {
  signUpValidation,
  sigInValidation,
  updateUserValidation,
  updateAvatarValidation,
  createCardValidation,
};
