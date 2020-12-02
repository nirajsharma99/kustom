const mongoose = require('mongoose');
var NumberInt = require('mongoose-int32');

mongoose.createConnection(
  'mongodb://localhost:27017/user',
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (!error) {
      console.log('Admin database connected');
    } else {
      console.log('error connecting to admin database.');
    }
  }
);

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    //required: true,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

var admins = (module.exports = mongoose.model('admins', adminSchema));
