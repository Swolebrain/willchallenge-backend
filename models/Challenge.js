const mongoose = require('mongoose');

const ChallengeEvidenceEntrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  upvotes: Number,
  downvotes: Number,
  fileUrl: String,
  description: String
});



const ChallengeSchema = new mongoose.Schema({
  owner: {type: String, required: true},
  ownerName: String,
  ownerPicture: String,
  description: {type: String, required: true},
  subscribers: [
    {
      user: {type: mongoose.Schema.ObjectId, ref: 'User'},
      challengeEvidenceEntries: [ { type: mongoose.Schema.ObjectId, ref: 'ChallengeEvidenceEntry' } ]
    }
  ]
  });

  module.exports = {
    ChallengeEvidenceEntrySchema,
    ChallengeSchema
  }