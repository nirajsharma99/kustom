const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/user",   {useUnifiedTopology: true ,useNewUrlParser: true } ,(error)=>{
    if(!error)
    {
        console.log("Database connected");
    }
    else{
        console.log("error connecting to database.");
    }
});

//define mongoose schema
var registrationSchema = new mongoose.Schema({
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
    password:{
        type:String,
        required: true
    },
     device:{
        type:String,
        default:null
    },
    usertype:{
        type:String,
        default: 'local'
    },
    date:{
        type: Date,
        default: Date.now
    }
});



var registration = module.exports = mongoose.model('registration',registrationSchema);
