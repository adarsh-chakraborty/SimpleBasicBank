const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },

    amount: Number
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', schema);
