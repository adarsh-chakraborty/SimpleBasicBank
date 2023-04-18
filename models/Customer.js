const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: String,
    email: String,
    balance: Number
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Customer', schema);
