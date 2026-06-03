const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  s3Key: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  // Holds the calculated structural peaks of the audio

  // Plagiarism analysis metrics
  isPlagiarized: { type: Boolean, default: false },
  matchPercentage: { type: Number, default: 0 },
  matchedWithFile: { type: String, default: 'None' },
  fingerprint: {
    type: String,
    default: ''
  },

  isPlagiarized: {
    type: Boolean,
    default: false
  },

  matchPercentage: {
    type: Number,
    default: 0
  },

  matchedWithFile: {
    type: String,
    default: 'None'
  },
}, { timestamps: true });

module.exports = mongoose.model('Recording', recordingSchema);