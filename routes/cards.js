const router = require('express').Router();

const {
  getCard,
  createCard,
  deleteCard,
  setLike,
  removeLike,
} = require('../controllers/cards');

router.get('/', getCard);
router.post('/', createCard);
router.delete('/:cardId', deleteCard);
router.put('/:cardId/likes', setLike);
router.delete('/:cardId/likes', removeLike);

module.exports = router;
