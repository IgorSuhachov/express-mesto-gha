const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes');

const { PORT = 3000 } = process.env;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '6462e0af9805ac392811d2a5',
  };

  next();
});

app.use(router);

mongoose
  .connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true, useUnifiedTopology: true, family: 4 })
  .then(() => {
    console.log('База данных подключена');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`Сервер запущен на ${PORT} порту`);
});
