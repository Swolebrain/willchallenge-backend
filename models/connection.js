const mongoose = require('mongoose');

let connectionString = 'mongodb://localhost/willchallenge';

const connection = mongoose.createConnection(
  connectionString,
  {promiseLibrary: global.Promise});

module.exports = connection;