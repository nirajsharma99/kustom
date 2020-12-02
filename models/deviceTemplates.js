const mongoose = require('mongoose');
var NumberInt = require('mongoose-int32');

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
    //required: true,
  },
  joindate: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  projectname: {
    type: String,
    //required: true,
  },
  androidversion: {
    type: String,
    //required: true,
  },
  romversion: {
    type: String,
    //required: true,
  },
  device: {
    type: String,
    //required: true,
  },
  romtype: {
    type: String,
    //required: true,
  },
  updatetype: {
    type: String,
    //required: true,
  },
  developerpicture: {
    type: String,
    //required: true,
  },
  filename: {
    type: String,
    //required: true,
  },
  downloads: {
    type: NumberInt,
    default: 0,
  },
  raters: [
    {
      username: {
        type: String,
      },
      rated: {
        type: NumberInt,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

var ysltemplate = (module.exports = mongoose.model(
  'ysltemplate',
  ysltemplateSchema
));
