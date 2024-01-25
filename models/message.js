const mongoose = require('mongoose');

const { DateTime } = require('luxon');

const MessageSchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 70 },
  body: { type: String, required: true, maxLength: 280 },
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  time: { type: Date, default: Date.now() },
});

MessageSchema.virtual('url').get(function () {
  return `/message/${this._id}`;
});

MessageSchema.virtual('time_iso').get(function () {
  const timeISO = DateTime.fromJSDate(this.time).toISO({
    suppressSeconds: true,
    suppressMilliseconds: true,
    includeOffset: false,
  });
  const timeArray = timeISO.split('T');
  return `${timeArray[0]} ${timeArray[1]}`;
});

module.exports = mongoose.model('Message', MessageSchema);
