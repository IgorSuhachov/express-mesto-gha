const jwt = require('jsonwebtoken');

const Unauthorized = require('../errors/Unauthorized');

const authorization = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    next(new Unauthorized('Пользователь не авторизован'));
  }

  jwt.verify(token, 'SECRET_KEY', (err, payload) => {
    if (err) {
      next(new Unauthorized('Invalid token'));
    }
    req.user = payload;
    next();
  });
};

module.exports = { authorization };
