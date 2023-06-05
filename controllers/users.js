const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequest = require('../errors/BadRequest');
const Unauthorized = require('../errors/Unauthorized');
const NotFound = require('../errors/NotFound');
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
    .catch(() => next(new InternalServerError('Ошибка по умолчанию.')));
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные при получении пользователя.'));
      }
      if (err instanceof DocumentNotFoundError) {
        next(new NotFound('Пользователь по указанному _id не найден.'));
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
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
        const { id } = user;
        res.status(201).send(name, about, avatar, email, id);
      })
      .catch((err) => {
        if (err instanceof ValidationError) {
          next(new BadRequest('Переданы некорректные данные при создании пользователя.'));
        }
        next(new InternalServerError('Ошибка по умолчанию.'));
      });
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        throw new Error('Invalid email or password');
      }

      bcrypt
        .compare(password, user.password)
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
            throw new Error('Invalid email or password');
          }
        })
        .catch((err) => {
          res.send(err.message);
        });
    })
    .catch((err) => {
      next(new Unauthorized(err.message));
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError || err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные при обновлении профиля.'));
      }
      if (err instanceof DocumentNotFoundError) {
        next(new NotFound('Пользователь с указанным _id не найден.'));
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError || err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные при обновлении аватара.'));
      }
      if (err instanceof DocumentNotFoundError) {
        next(new NotFound('Пользователь с указанным _id не найден.'));
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
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
