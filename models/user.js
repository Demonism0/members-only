const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, maxLength: 100 },
  lastName: { type: String, required: true, maxLength: 100 },
  username: {
    type: String, required: true, maxLength: 38, minLength: 2,
  },
  password: { type: String, required: true, maxLength: 100 },
  memberStatus: {
    type: String,
    required: true,
    enum: ['Guest', 'Member', 'Admin'],
    default: 'Guest',
  },
});

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
