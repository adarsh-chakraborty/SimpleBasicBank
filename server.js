const express = require('express');
const mongoose = require('mongoose');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = express();
const PORT = process.env.PORT || 3000;

const Customer = require('./models/Customer');
const Trasactions = require('./models/Transactions');

app.use(express.json());
app.use(express.static('public'));

app.get('/customers', async (req, res) => {
  const result = await Customer.find({});
  res.json(result);
});

app.get('/transactions', async (req, res) => {
  // sort the result by latest transaction first

  const result = await Trasactions.find({})
    .populate('sender')
    .populate('receiver')
    .sort({ createdAt: -1 });

  res.json(result);
});

app.post('/transfer', async (req, res) => {
  console.log(req.body);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { sender, receiver } = req.body;
    let { amount } = req.body;

    if (!sender || !receiver || !amount) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }
    if (sender === receiver) {
      return res
        .status(400)
        .json({ message: 'Sender and Receiver cannot be same' });
    }
    // Check if amount is a valid Number and is greater than 0
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: 'Amount should be greater than 0' });
    }
    // convert amount to a number
    amount = Number(amount);

    const senderCustomer = await Customer.findById(sender);
    const receiverCustomer = await Customer.findById(receiver);
    if (senderCustomer.balance < amount) {
      return res.status(400).json({ message: 'Insufficient Balance' });
    }
    senderCustomer.balance -= amount;
    receiverCustomer.balance += amount;
    await senderCustomer.save();
    await receiverCustomer.save();
    const transaction = new Trasactions({
      sender: senderCustomer._id,
      receiver: receiverCustomer._id,
      amount
    });
    await transaction.save();
    await session.commitTransaction();
    res.json({
      message: 'Transaction Successful',
      status: 'success'
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Something went wrong' });
  } finally {
    session.endSession();
  }
});

mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    app.listen(PORT, async () => {
      // await seedDatabase();
      console.log(
        `Server started in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  })
  .catch((err) => console.log(err));

async function seedDatabase() {
  const customers = [
    {
      name: 'Adarsh Chakraborty',
      email: 'adarshchak108@gmail.com',
      balance: 10000
    },
    {
      name: 'Rahul Roy',
      email: 'rahul1000@gmail.com',
      balance: 10000
    },
    {
      name: 'Amit Kumar',
      email: 'amitkumar@gmail.com',
      balance: 10000
    },
    {
      name: 'Kunal Singh',
      email: 'singh.kunal@gmail.com',
      balance: 10000
    },
    {
      name: 'Yash Sharma',
      email: 'yash@gmail.com',
      balance: 10000
    },
    {
      name: 'Jatin Sharma',
      email: 'jatin.sh@gmail.com',
      balance: 10000
    },
    {
      name: 'Rahul Singh',
      email: 'singh.rahul@gmail.com',
      balance: 10000
    },
    {
      name: 'Piyush Bhardwaj',
      email: 'b.piyush@gmail.com',
      balance: 10000
    },
    {
      name: 'Yenil Sharma',
      email: 'yenish.sharma@gmail.com',
      balance: 10000
    },
    {
      name: 'Ishita Sharma',
      email: 'ishita.s@gmail.com',
      balance: 10000
    }
  ];
  console.log('Purging all transactions');
  await Trasactions.deleteMany({});
  console.log('Purging all customers');
  await Customer.deleteMany({});
  console.log('Seeding customers');
  await Customer.insertMany(customers);
  console.log('Seeding done.');
}
