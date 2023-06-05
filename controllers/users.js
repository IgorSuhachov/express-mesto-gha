const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');

const BadRequest = require('../errors/BadRequest');
const Unauthorized = require('../errors/Unauthorized');
const NotFound = require('../errors/NotFound');
const Conflict = require('../errors/Conflict');
const InternalServerError = require('../errors/InternalServerError');

const lifetime = 7 * 24 * 60 * 60 * 1000;

const { CastError, ValidationError, DocumentNotFoundError } = mongoose.Error;

const getUser = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => next(new InternalServerError('Ошибка по умолчанию.')));
};
const getMe = (req, res, next) => {
  const userId = req.user._id;
  User.findOne({ _id: userId })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        next(new NotFound('Пользователь не найден'));
      }
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError) {
        return next(new BadRequest('Переданы некорректные данные при получении пользователя.'));
      }
      if (err instanceof DocumentNotFoundError) {
        return next(new NotFound('Пользователь по указанному _id не найден.'));
      }
      return new InternalServerError('Ошибка по умолчанию.');
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, password, email,
  } = req.body;

  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      name,
      about,
      avatar,
      password: hash,
      email,
    })
      .then((user) => {
        res.status(201).send(user);
      })
      .catch((err) => {
        if (err instanceof ValidationError) {
          return next(new BadRequest('Переданы некорректные данные при создании пользователя.'));
        }
        if (err.code === 11000) {
          return next(new Conflict('Пользователь уже существует.'));
        }
        return next(new InternalServerError('Ошибка по умолчанию.'));
      });
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!validator.isEmail(email)) {
    throw new BadRequest('Переданы некорректные данные при создании пользователя.');
  }

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new Unauthorized('Invalid email or password');
      }

      bcrypt
        .compare(password, user.password)
        // eslint-disable-next-line consistent-return
        .then((matched) => {
          if (matched) {
            const token = jwt.sign({ _id: user._id }, 'SECRET_KEY');
            res
              .cookie('jwt', token, {
                maxAge: lifetime,
                httpOnly: true,
              })
              .send(user.toJSON());
          } else {
            return next(new Unauthorized('Invalid email or password'));
          }
        })
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err instanceof Unauthorized) {
        next(err);
      }
      return next(new BadRequest(err.message));
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError || err instanceof ValidationError) {
        return next(new BadRequest('Переданы некорректные данные при обновлении профиля.'));
      }
      if (err instanceof DocumentNotFoundError) {
        return next(new NotFound('Пользователь с указанным _id не найден.'));
      }
      return next(new InternalServerError('Ошибка по умолчанию.'));
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError || err instanceof ValidationError) {
        return next(new BadRequest('Переданы некорректные данные при обновлении аватара.'));
      }
      if (err instanceof DocumentNotFoundError) {
        return next(new NotFound('Пользователь с указанным _id не найден.'));
      }
      return next(new InternalServerError('Ошибка по умолчанию.'));
    });
};

module.exports = {
  getUser,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getMe,
};
