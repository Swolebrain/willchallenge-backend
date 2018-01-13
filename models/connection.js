const mongoose = require('mongoose');
const {
  ChallengeEvidenceEntrySchema,
  ChallengeSchema
} = require('./Challenge.js');

let connectionString = 'mongodb://localhost/willchallenge';

const connection = mongoose.createConnection(
  connectionString,
  {promiseLibrary: global.Promise});

const ChallengeEvidence = connection
  .model('ChallengeEvidenceEntry', ChallengeEvidenceEntrySchema);

const Challenge = connection.model('Challenge', ChallengeSchema);


module.exports = {
  ChallengeEvidence,
  Challenge,
  connection
};