const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async userData => {
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) throw new Error('Email already registered');

  const user = new User(userData);

  const savedUser = await user.save();

  return savedUser;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  return { user, token };
};

module.exports = { registerUser, loginUser };
