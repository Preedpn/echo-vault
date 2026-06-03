const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  fileName: String,
  hash: String,
  s3Key: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Audio', audioSchema);