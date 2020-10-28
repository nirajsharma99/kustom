const express = require("express");
const application = express();
const path = require("path");
const expressHandlerbars = require("express-handlebars");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const { ensureAuthenticated } = require('./config/auth');
const MongoDBStore = require('connect-mongodb-session')(session);
require('./config/passport')(passport);

const registration = require("./models/registrationmongo");
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/user',
    collection: 'mySessions'
  });
application.use(bodyparser.urlencoded({
    extended : true
}))



application.use('/static',express.static(__dirname + '/static'));

application.use(express.urlencoded({extended: true}))

application.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: true,
      //cookie: {secure: false },
      store: store
    })
  );

  application.use(passport.initialize());
  application.use(passport.session());

application.use(function(req,res,next){
    res.locals.isAuthenticated =req.isAuthenticated();
    next();
})

application.use(flash());
// Global variables
application.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg= req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

/*function isLoggedIn(req,res,next){
      if(req.isAuthenticated()){
          res.locals.username=req.user.username;
          res.locals.usertype=req.user.usertype;
          return next();
      }
      res.redirect('/');
  }*/



application.set('view engine','pug')
application.set('views',[path.join(__dirname,'views'),path.join(__dirname, '/views/homepage')]);

application.get("/",(req,res)=>{
    res.status(200).render('homepage.pug');
})
application.get('*', (req, res, next) => {
    user = req.user || null;
    next();
 });
application.get("/xiaomi",(req,res)=>{
    res.status(200).render('xiaomi.pug');
})


application.get("/google",(req,res)=>{
    res.status(200).render('google.pug');
})
application.get("/samsung",(req,res)=>{
    res.status(200).render('samsung.pug');
})
application.get("/oneplus",(req,res)=>{
    res.status(200).render('oneplus.pug');
})
application.get("/motorola",(req,res)=>{
    res.status(200).render('motorola.pug');
})
application.get("/ysl",(req,res)=>{
    res.status(200).render('ysl.pug');
})
application.get("/havoc-ysl",(req,res)=>{
    res.status(200).render('havoc-ysl.pug');
})



application.get("/registration",(req,res)=>{
    res.status(200).render('registration.pug');  
})

application.get("/homepage", (req,res)=>{
    res.status(200).render('homepage.pug',user=req.user);  
})
application.get("/homepage/dashboard",ensureAuthenticated,(req,res)=>{
    res.status(200).render('dashboard.pug');
})

application.get("/devregistration",(req,res)=>{
    res.status(200).render('devregistration.pug');
})

application.get("/loginfailure",(req,res)=>{
    res.status(200).render('loginfailure.pug');
})

application.get("/logout",(req,res)=>{
    req.logOut();
    req.session.destroy();
    res.redirect("/");
})

application.listen("3000", ()=>{
    console.log("server started");
});     





application.post('/registration',(req,res)=>{
    const { username, email, password, cpassword } = req.body;
    let errors=[];
    registration.findOne({username: req.body.username}).then(user=>{
        if(user){
            errors.push({msg: "Username already exist!"})
            res.render('registration.pug', {
                errors,
                username,
                email,
                password,
                cpassword
              });
        }
    })
    registration.findOne({email: req.body.email}).then(user =>{
    if(user){
        errors.push({msg: "Email already exists!"})
        res.render('registration.pug', {
            errors,
            username,
            email,
            password,
            cpassword
          });
    }

    else {
    const newLocal = 10;
    var userData = new registration(req.body);
    req.body.password = bcrypt.hashSync(req.body.password, newLocal);
   const today = new Date()
    userData.username= req.body.username,
    userData.email= req.body.email,
    userData.password=req.body.password,
    userData.date=today,
    userData.usertype="local"
    userData.save().then(()=>{
        req.flash('success_msg', 'User registered!, try Logging-in :)');
        res.redirect('/registration')
    }).catch(()=>{
        req.flash('error_msg', "Sorry, User not registered! :(")
        res.redirect('/registration')
    });
}
})
});


application.post('/devregistration',(req,res)=>{
    const { username, device , email, password, cpassword } = req.body;
    let errors=[];
    registration.findOne({username: req.body.username}).then(user=>{
        if(user){
            errors.push({msg: "Username already exist!"})
            res.render('devregistration.pug', {
                errors,
                username,
                email,
                device,
                password,
                cpassword
              });
        }
    })
    registration.findOne({email: req.body.email}).then(user =>{
    if(user){
        errors.push({msg: "Email already exists!"})
        res.render('devregistration.pug', {
            errors,
            username,
            device,
            email,
            password,
            cpassword
          });
    }
    else {
    const newLocal = 10;
    var userData = new registration(req.body);
    req.body.password = bcrypt.hashSync(req.body.password, newLocal);
   const today = new Date()
    userData.username= req.body.username,
    userData.email= req.body.email,
    userData.device= req.body.device,
    userData.password=req.body.password,
    userData.date=today
    userData.usertype="developer"
    userData.save().then(()=>{
        req.flash('success_msg', 'User registered! , try Logging-in :)');
        res.redirect('/devregistration')
    }).catch(()=>{
        req.flash('error_msg', "Sorry, User not registered! :(")
        res.redirect('/devregistration')
    });
}
})
});


// Login
application.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/homepage',
      failureRedirect: '/loginfailure',
      failureFlash: true
    })(req, res, next);
  });
application.get('/profile',(req,res)=>{
    var decoded=jwt.verify(req.headers['authorization'],process.env.SECRET_KEY)
    registration.findOne({
        _id:decoded._id
    })
    .then(user=>{
        if(user){
            res.json(user)
        }else{
            res.send('User does not exist')
        }
    })
    .catch(err=>{
        res.send('error:'+err)
    })
})


module.exports=application;




