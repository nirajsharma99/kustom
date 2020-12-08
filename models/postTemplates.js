const mongoose = require('mongoose');
var NumberInt = require('mongoose-int32');

mongoose.createConnection(
  'mongodb://localhost:27017/user',
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (!error) {
      console.log('PostTemplate database connected');
    } else {
      console.log('error connecting to PostTemplate database.');
    }
  }
);

const Schema = mongoose.Schema;

const postTemplateSchema = new Schema({
  author: {
    type: String,
    //required: true,
  },
  authorportfolio: {
    type: String,
    //required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  postindex: {
    type: NumberInt,
    //required: true,
  },
  heading: {
    type: String,
    //required: true,
  },
  postname: {
    type: String,
    //required: true,
  },
  description: {
    type: String,
    //required: true,
  },

  thumbnailfilename: {
    type: String,
    //required: true,
  },
  postpicfilename: {
    type: String,
    //required: true,
  },
  authorpicfilename: {
    type: String,
    //required: true,
  },
  purpose: {
    type: String,
    //required: true,
  },
  content: {
    type: String,
    //required: true,
  },
  authortwitter: {
    type: String,
    //required: true,
  },
  authorinstagram: {
    type: String,
    //required: true,
  },
});

var postTemplate = (module.exports = mongoose.model(
  'postTemplate',
  postTemplateSchema
));
