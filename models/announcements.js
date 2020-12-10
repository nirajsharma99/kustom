const mongoose = require('mongoose');
var NumberInt = require('mongoose-int32');

mongoose.createConnection(
  'mongodb://localhost:27017/user',
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (!error) {
      console.log('Announcements database connected');
    } else {
      console.log('error connecting to Announcements database.');
    }
  }
);

const Schema = mongoose.Schema;

const announcementsSchema = new Schema({
  author: {
    type: String,
    //required: true,
  },
  to: {
    type: String,
    //required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  heading: {
    type: String,
    //required: true,
  },
  content: {
    type: String,
    //required: true,
  },
});

var announcements = (module.exports = mongoose.model(
  'announcements',
  announcementsSchema
));
