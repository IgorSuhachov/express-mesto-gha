const mongoose = require('mongoose');
const validator = require('validator');

const urlRegExp = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (value) => urlRegExp.test(value),
      message: 'Invalid link',
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Invalid email',
    },
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.methods.toJSON = function () {
  const data = this.toObject();
  delete data.password;
  // eslint-disable-next-line no-underscore-dangle
  delete data.__v;
  return data;
};

module.exports = mongoose.model('user', userSchema);
