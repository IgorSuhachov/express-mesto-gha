const mongoose = require('mongoose');
const Cards = require('../models/card');

const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');
const InternalServerError = require('../errors/InternalServerError');

const { CastError, ValidationError, DocumentNotFoundError } = mongoose.Error;

const getCard = (req, res, next) => {
  Cards.find({})
    .then((cards) => res.send(cards))
    .catch(() => next(new InternalServerError('Ошибка по умолчанию.')));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user;
  Cards.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные при создании карточки.'));
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    });
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  Cards.findById(cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFound('Карточка с указанным _id не найдена.'));
      }
      if (card.owner.toString() !== userId) {
        return next(new Forbidden('У вас нет прав на удаление карточки.'));
      }

      return Cards.findByIdAndRemove(cardId)
        .then((removedCard) => {
          res.send(removedCard);
        })
        .catch(() => next(new InternalServerError('Ошибка по умолчанию.')));
    })
    .catch((err) => {
      if (err instanceof CastError) {
        return next(new BadRequest('Переданы некорректные данные при создании карточки.'));
      }
      if (err instanceof DocumentNotFoundError) {
        return next(new NotFound('Карточка с указанным _id не найдена.'));
      }
      return next(new InternalServerError('Ошибка по умолчанию.'));
    });
};

const setLike = (req, res, next) => {
  Cards.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => res.send(card))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные при создании карточки.'));
      }
      if (err instanceof DocumentNotFoundError) {
        next(new NotFound('Карточка с указанным _id не найдена.'));
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    });
};
const removeLike = (req, res, next) => {
  Cards.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => res.send(card))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные при создании карточки.'));
      }
      if (err instanceof DocumentNotFoundError) {
        next(new NotFound('Карточка с указанным _id не найдена.'));
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    });
};

module.exports = {
  getCard,
  createCard,
  deleteCard,
  setLike,
  removeLike,
};
