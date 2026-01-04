// server.js
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'https://your-frontend-domain.com' })); // Adjust for your frontend domain

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  paid: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ error: 'Username or email already exists!' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications.create({ to: email, channel: 'email' });

    res.json({ message: 'Verification sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

app.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  try {
    const check = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks.create({ to: email, code });

    if (check.status === 'approved') {
      await User.updateOne({ email }, { verified: true });
      res.json({ message: 'Verified' });
    } else {
      res.status(400).json({ error: 'Invalid code' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password) || !user.verified) {
      return res.status(400).json({ error: 'Invalid email or password, or not verified!' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username, paid: user.paid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/pay', authenticate, async (req, res) => {
  try {
    await User.updateOne({ _id: req.userId }, { paid: true });
    res.json({ message: 'Paid' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

app.get('/check', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ paid: user.paid, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
