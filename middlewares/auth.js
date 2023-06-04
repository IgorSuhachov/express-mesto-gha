const jwt = require('jsonwebtoken');

const UNAUTHORIZED = 401;

const authorization = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    res.status(401).send('Пользователь не авторизован');
  }

  jwt.verify(token, 'SECRET_KEY', (err, payload) => {
    if (err) {
      res.status(UNAUTHORIZED).send('Invalid token');
    }
    req.user = payload;
    next();
  });
};

module.exports = { authorization };
