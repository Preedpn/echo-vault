const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const { generatePresignedUrl } = require('../services/s3.service');
const Recording = require('../models/recording');



const router = express.Router();

function nowISO() {
  return new Date().toISOString();
}

function buildS3Key(originalName) {
  const safeName = (originalName || 'audio-mp3')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  return `recordings/${Date.now()}_${safeName}`;
}

/*
  AUDIO FINGERPRINT
  Converts audio buffer into SHA256 hash
*/
function generateFingerprint(buffer) {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
}
// =========================
// AUDIO FINGERPRINT HELPERS
// =========================



function calculateSimilarity(hash1, hash2) {
  let matches = 0;

  for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
    if (hash1[i] === hash2[i]) {
      matches++;
    }
  }

  return Math.round((matches / hash1.length) * 100);
}

// ============================================
// STEP 1 - INITIALIZE UPLOAD
// ============================================

router.post('/upload/initialize', async (req, res) => {
  try {
    const originalName = req.body?.originalName;

    if (!originalName) {
      return res.status(400).json({
        error: 'originalName is required'
      });
    }

    const s3Key = buildS3Key(originalName);

    const recording = await Recording.create({
      fileName: originalName,
      s3Key,
      status: 'Pending',
      fingerprint: '',
      isPlagiarized: false,
      matchPercentage: 0,
      matchedWithFile: 'None'
    });

    const uploadUrl = await generatePresignedUrl(s3Key);

    console.log(
      `[${nowISO()}] Generated upload URL for key=${s3Key}`
    );

    return res.status(200).json({
      uploadUrl,
      recordingId: recording._id
    });

  } catch (err) {
    console.error('initialize failed', err);

    return res.status(500).json({
      error: 'initialize failed'
    });
  }
});

// ============================================
// STEP 2 - CONFIRM UPLOAD + DUPLICATE CHECK
// ============================================

router.patch('/upload/confirm/:recordingId', async (req, res) => {
  try {

    const { recordingId } = req.params;
    const { audioBase64 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recordingId)) {
      return res.status(400).json({
        error: 'Invalid recordingId'
      });
    }

    if (!audioBase64) {
      return res.status(400).json({
        error: 'audioBase64 missing'
      });
    }

    const recording = await Recording.findById(recordingId);

    if (!recording) {
      return res.status(404).json({
        error: 'Recording not found'
      });
    }

    // Convert base64 → buffer
    const buffer = Buffer.from(audioBase64, 'base64');

    // Generate fingerprint
    const fingerprint = generateFingerprint(buffer);

    console.log("Recording ID:", recordingId);
    console.log("Generated fingerprint:", fingerprint);
    console.log("Current fingerprint:", fingerprint);

const allMatches = await Recording.find({ fingerprint });

console.log("MATCH COUNT:", allMatches.length);

allMatches.forEach(m => {
  console.log({
    id: m._id.toString(),
    file: m.fileName,
    fingerprint: m.fingerprint
  });
});
    // Check duplicates
    const duplicate = await Recording.findOne({
      fingerprint,
      // _id: { $ne: recordingId }
    });
console.log("DUPLICATE RESULT:", duplicate);
    if (duplicate) {

      recording.status = 'Uploaded';
      recording.fingerprint = fingerprint;
      recording.isPlagiarized = true;
      recording.matchPercentage = 100;
      recording.matchedWithFile = duplicate.fileName;

      await recording.save();

      return res.status(200).json({
        ok: true,
        plagiarismDetected: true,
        matchedWithFile: duplicate.fileName,
        matchPercentage: 100
      });
    }

    // No duplicate found
    recording.status = 'Uploaded';
    recording.fingerprint = fingerprint;
    recording.isPlagiarized = false;
    recording.matchPercentage = 0;
    recording.matchedWithFile = 'None';

    await recording.save();

    return res.status(200).json({
      ok: true,
      plagiarismDetected: false
    });

  } catch (err) {

    console.error('confirm failed', err);

    return res.status(500).json({
      error: 'confirm failed'
    });
  }
});

// ============================================
// GET MEETINGS
// ============================================

router.get('/meetings', async (_req, res) => {
  try {

    const recordings = await Recording
      .find({})
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      meetings: recordings
    });

  } catch (err) {

    return res.status(500).json({
      error: 'meetings failed'
    });
  }
});

// ============================================
// DISABLED SIMULATION
// ============================================

router.post('/meetings/simulate-ai/:id', async (_req, res) => {

  return res.status(400).json({
    error: 'Simulation disabled. Use live streaming pipeline parameters.'
  });

});

module.exports = router;