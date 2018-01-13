const mongoose = require('mongoose');

module.exports = function(connection){
  const ChallengeEvidenceEntrySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    upvotes: Number,
    downvotes: Number,
    fileUrl: String,
    description: String
  });

  const ChallengeEvidence = connection.model('ChallengeEvidenceEntry', ChallengeEvidenceEntrySchema);

  const ChallengeSchema = new mongoose.Schema({
    owner: {type: String, required: true},
    subscribers: [
      {
        userId: String,
        challengeEvidenceEntries: [ { type: mongoose.Schema.ObjectId, ref: 'ChallengeEvidenceEntry' } ]
      }
    ]
  });

  const Challenge = connection.model('Challenge', ChallengeSchema);
  return {
    ChallengeEvidence,
    Challenge
  };
}
