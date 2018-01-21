const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: {type: String, required: true, index: true},
  challengesSubscribed: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Challenge'} ],
  firstName: String,
  lastName: String,
  pictureUrl: String
});

module.exports =  {
  UserSchema
};