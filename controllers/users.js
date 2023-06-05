const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const CONFLICT = 409;
const INTERNAL_SERVER_ERROR = 500;

const lifetime = 7 * 24 * 60 * 60 * 1000;

const { CastError, ValidationError, DocumentNotFoundError } = mongoose.Error;

const getUser = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));
};
const getMe = (req, res) => {
  const userId = req.user._id;
  User.findOne({ _id: userId })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.send(NOT_FOUND).send({ message: 'Пользователь не найден' });
      }
    })
    .catch(() => res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));
};

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError) {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при получении пользователя.' });
      }
      if (err instanceof DocumentNotFoundError) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar, password, email } = req.body;

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
          return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
        }
        return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
      });
  });
};

const login = (req, res) => {
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
      res.status(UNAUTHORIZED).send(err.message);
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError || err instanceof ValidationError) {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      }
      if (err instanceof DocumentNotFoundError) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден. ' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError || err instanceof ValidationError) {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }
      if (err instanceof DocumentNotFoundError) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
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
