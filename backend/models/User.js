const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
});

// Create the User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
