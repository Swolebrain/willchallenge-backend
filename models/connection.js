const mongoose = require('mongoose');
const {
  ChallengeEvidenceEntrySchema,
  ChallengeSchema
} = require('./Challenge.js');
const {
  UserSchema
} = require('./User');

let connectionString = 'mongodb://localhost/willchallenge';

const connection = mongoose.createConnection(
  connectionString,
  {promiseLibrary: global.Promise});

const ChallengeEvidence = connection
  .model('ChallengeEvidenceEntry', ChallengeEvidenceEntrySchema);

const Challenge = connection.model('Challenge', ChallengeSchema);

const User = connection.model('User', UserSchema);

module.exports = {
  ChallengeEvidence,
  Challenge,
  User,
  connection
};