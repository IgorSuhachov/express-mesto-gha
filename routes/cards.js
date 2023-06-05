const router = require('express').Router();

const { getCard, createCard, deleteCard, setLike, removeLike } = require('../controllers/cards');

const { authorization } = require('../middlewares/auth');

router.get('/', authorization, getCard);
router.post('/', authorization, createCard);
router.delete('/:cardId', authorization, deleteCard);
router.put('/:cardId/likes', authorization, setLike);
router.delete('/:cardId/likes', authorization, removeLike);

module.exports = router;
