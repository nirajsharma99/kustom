const mongoose = require('mongoose');

var devregistrationSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    device:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required: true
    },
    usertype:{
        type:String,
        default: 'dev'
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var devregistration = module.exports = mongoose.model('devregistration',devregistrationSchema);