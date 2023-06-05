const router = require('express').Router();

const {
  getCard, createCard, deleteCard, setLike, removeLike,
} = require('../controllers/cards');

const { authorization } = require('../middlewares/auth');
const { createCardValidation, cardIdValidation } = require('../Utils/validation');

router.get('/', authorization, getCard);
router.post('/', authorization, createCardValidation, createCard);
router.delete('/:cardId', authorization, cardIdValidation, deleteCard);
router.put('/:cardId/likes', authorization, cardIdValidation, setLike);
router.delete('/:cardId/likes', authorization, cardIdValidation, removeLike);

module.exports = router;
