const mongoose = require('mongoose');
var NumberInt = require('mongoose-int32');

mongoose.createConnection(
  'mongodb://localhost:27017/user',
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (!error) {
      console.log('Search-Tag database connected');
    } else {
      console.log('error connecting to Search-Tag database.');
    }
  }
);

const Schema = mongoose.Schema;

const searchTagSchema = new Schema({
  link: {
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
  description: {
    type: String,
    //required: true,
  },
});

var searchTag = (module.exports = mongoose.model('searchTag', searchTagSchema));
