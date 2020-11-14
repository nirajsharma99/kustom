const mongoose = require('mongoose');

mongoose.createConnection(
  'mongodb://localhost:27017/pages',
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (!error) {
      console.log('Pages database connected');
    } else {
      console.log('error connecting to pages database.');
    }
  }
);

const Schema = mongoose.Schema;

const ysltemplateSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    default: 'local',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  projectname: {
    type: String,
    required: true,
  },
  androidversion: {
    type: String,
    required: true,
  },
  romversion: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
});

var ysltemplate = (module.exports = mongoose.model(
  'ysltemplate',
  ysltemplateSchema
));
