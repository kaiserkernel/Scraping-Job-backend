const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  description: String,
  url: String,
  hash: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  isFraud: { type: Boolean, default: false },
});

module.exports = mongoose.model('Job', JobSchema);
