const express = require('express');
const application = express();
const path = require('path');
const multer = require('multer');
const expressHandlerbars = require('express-handlebars');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const { ensureAuthenticated } = require('./config/auth');
const MongoDBStore = require('connect-mongodb-session')(session);
require('./config/passport')(passport);
var objid = require('mongodb').ObjectID;
const dbConnect = require('./commentdb');

dbConnect();
application.use(express.json());
const Comment = require('./models/comment');
const registration = require('./models/registrationmongo');
const ysltemplate = require('./models/pages');
//routes for comments
application.post('/api/comments', (req, res) => {
  const comment = new Comment({
    username: req.body.username,
    usertype: req.body.usertype,
    comment: req.body.comment,
  });
  comment.save().then((response) => {
    res.send(response);
  });
});

application.get('/api/comments', (req, res) => {
  Comment.find().then(function (comments) {
    res.send(comments);
  });
});

//routes for replies
application.post('/api/replies', (req, res) => {
  const IDpassed = req.body.objectId;
  const newreplies = {
    _id: new ObjectID(),
    reply: req.body.reply,
    username: req.body.username,
    usertype: req.body.usertype,
    date: Date(),
  };
  //console.log(`api working${newreplies.reply}${newreplies.username}${newreplies.usertype}${IDpassed}`)
  Comment.collection
    .updateOne({ _id: objid(IDpassed) }, { $push: { replies: newreplies } })
    .then(() => {
      console.log('Reply added');
    })
    .catch((err) => {
      console.log(err);
    });
});

application.post('/api/deletecomment', (req, res) => {
  //console.log('hello api working')

  const deleteid = req.body.ID;
  Comment.findOneAndRemove({ _id: objid(deleteid) })
    .then(() => {
      console.log('comment deleted');
    })
    .catch((err) => {
      console.log(err);
    });
});
application.post('/api/deletereply', (req, res) => {
  const replyId = req.body.index;
  const objectId = req.body.commentID;
  //console.log('deletereply api working'+replyIndex+objectId);
  Comment.collection
    .updateOne(
      { _id: objid(objectId), 'replies._id': objid(replyId) },
      { $unset: { replies: replyId } }
    )
    .then(() => {
      console.log('Reply deleted');
    })
    .catch((err) => {
      console.log(err);
    });
});
application.post('/api/dolike', (req, res) => {
  const obj = req.body.objectId;
  Comment.find({ _id: objid(obj) }).then(function (comment) {
    res.send(comment);
  });
});
application.post('/api/removeliker', (req, res) => {
  const ID = req.body.objectId;
  const username = req.body.username;
  Comment.collection
    .updateOne({ _id: objid(ID) }, { $pull: { liker: username } })
    .then(() => {
      console.log('liker removed');
    })
    .catch((err) => {
      console.log(err);
    });
});
application.post('/api/addliker', (req, res) => {
  const ID = req.body.obj;
  const username = req.body.username;
  const status = req.body.status;
  const likecount = req.body.likecount;
  Comment.collection
    .updateOne(
      { _id: objid(ID) },
      { $push: { likedislike: { username: username, status: status } } }
    )
    .then(() => {
      console.log('liker added');
    })
    .catch((err) => {
      console.log(err);
    });
  Comment.collection
    .updateOne({ _id: objid(ID) }, { $set: { likeCount: likecount } })
    .then(() => {
      console.log('like count updated');
    })
    .catch((err) => {
      console.log(err);
    });
});
application.post('/api/adddisliker', (req, res) => {
  const ID = req.body.obj;
  const username = req.body.username;
  const status = req.body.status;
  const dislikecount = req.body.dislikecount;
  Comment.collection
    .updateOne(
      { _id: objid(ID) },
      { $push: { likedislike: { username: username, status: status } } }
    )
    .then(() => {
      console.log('disliker added');
    })
    .catch((err) => {
      console.log(err);
    });
  Comment.collection
    .updateOne({ _id: objid(ID) }, { $set: { dislikeCount: dislikecount } })
    .then(() => {
      console.log('disklike count updated');
    })
    .catch((err) => {
      console.log(err);
    });
});

application.post('/api/changelikerdisliker', (req, res) => {
  const ID = req.body.obj;
  const username = req.body.username;
  const status = req.body.status;
  const likecount = req.body.likecount;
  const dislikecount = req.body.dislikecount;
  Comment.collection
    .updateOne(
      { _id: objid(ID), 'likedislike.username': username },
      {
        $set: {
          'likedislike.$.username': username,
          'likedislike.$.status': status,
        },
      }
    )
    .then(() => {
      console.log('liker disliker added');
    })
    .catch((err) => {
      console.log(err);
    });
  Comment.collection
    .updateOne(
      { _id: objid(ID) },
      { $set: { likeCount: likecount, dislikeCount: dislikecount } }
    )
    .then(() => {
      console.log('like count and dislike count updated');
    })
    .catch((err) => {
      console.log(err);
    });
});
var Storage = multer.diskStorage({
  destination: './static/uploads',
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '_' + Date.now() + path.extname(file.originalname)
    );
  },
});
var upload = multer({
  storage: Storage,
}).single('file');
application.post('/addtemplate', upload, (req, res) => {
  const template = new ysltemplate({
    username: req.body.username,
    joindate: req.body.joindate,
    projectname: req.body.projectname,
    androidversion: req.body.androidversion,
    romversion: req.body.romversion,
    device: req.body.device,
    file: req.body.file,
  });
  console.log('add template working' + file);
  /*template.save().then((response) => {
    res.send(response);
  });*/
});

const { ObjectID } = require('mongodb');
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/user',
  collection: 'mySessions',
});
application.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

application.use('/static', express.static(__dirname + '/static'));

application.use(express.urlencoded({ extended: true }));

application.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    //cookie: {secure: false },
    store: store,
  })
);

application.use(passport.initialize());
application.use(passport.session());

application.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

application.use(flash());
// Global variables
application.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
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

application.set('view engine', 'pug');
application.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, '/views/homepage'),
]);

application.get('/', (req, res) => {
  res.status(200).render('homepage.pug', (user = req.user));
});
application.get('*', (req, res, next) => {
  user = req.user || null;
  next();
});

application.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.status(200).render('dashboard.pug');
});

application.get('/projects', ensureAuthenticated, (req, res) => {
  res.status(200).render('projects.pug');
});

application.get('/addproject', ensureAuthenticated, (req, res) => {
  res.status(200).render('addproject.pug');
});

application.get('/xiaomi', (req, res) => {
  res.status(200).render('xiaomi.pug');
});

application.get('/google', (req, res) => {
  res.status(200).render('google.pug');
});
application.get('/samsung', (req, res) => {
  res.status(200).render('samsung.pug');
});
application.get('/oneplus', (req, res) => {
  res.status(200).render('oneplus.pug');
});
application.get('/motorola', (req, res) => {
  res.status(200).render('motorola.pug');
});
application.get('/ysl', (req, res) => {
  res.status(200).render('ysl.pug');
});
application.get('/havoc-ysl', (req, res) => {
  res.status(200).render('havoc-ysl.pug');
});

application.get('/registration', (req, res) => {
  res.status(200).render('registration.pug');
});

application.get('/devregistration', (req, res) => {
  res.status(200).render('devregistration.pug');
});

application.get('/loginfailure', (req, res) => {
  res.status(200).render('loginfailure.pug');
});

application.get('/logout', (req, res) => {
  req.logOut();
  req.session.destroy();
  res.redirect('back');
});

const server = application.listen('3000', () => {
  console.log('server started');
});

let io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log(`New Connection: ${socket.id}`);
  // Recieve event
  socket.on('comment', (data) => {
    console.log(data);
    data.time = Date();
    socket.broadcast.emit('comment', data);
  });
});

io.on('connection', (socket) => {
  console.log(`New reply connection: ${socket.id}`);
  //recieve event
  socket.on('reply', (replyData) => {
    console.log(replyData);
    //replyData.time = Date();
    //socket.broadcast.emit('reply', replyData);
  });
});

application.post('/registration', (req, res) => {
  const { username, email, password, cpassword } = req.body;
  let errors = [];
  registration.findOne({ username: req.body.username }).then((user) => {
    if (user) {
      errors.push({ msg: 'Username already exist!' });
      res.render('registration.pug', {
        errors,
        username,
        email,
        password,
        cpassword,
      });
    }
  });
  registration.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.push({ msg: 'Email already exists!' });
      res.render('registration.pug', {
        errors,
        username,
        email,
        password,
        cpassword,
      });
    } else {
      const newLocal = 10;
      var userData = new registration(req.body);
      req.body.password = bcrypt.hashSync(req.body.password, newLocal);
      const today = new Date();
      (userData.username = req.body.username),
        (userData.email = req.body.email),
        (userData.password = req.body.password),
        (userData.date = today),
        (userData.usertype = 'local');
      userData
        .save()
        .then(() => {
          req.flash('success_msg', 'User registered!, try Logging-in :)');
          res.redirect('/registration');
        })
        .catch(() => {
          req.flash('error_msg', 'Sorry, User not registered! :(');
          res.redirect('/registration');
        });
    }
  });
});

application.post('/devregistration', (req, res) => {
  const { username, device, email, password, cpassword } = req.body;
  let errors = [];
  registration.findOne({ username: req.body.username }).then((user) => {
    if (user) {
      errors.push({ msg: 'Username already exist!' });
      res.render('devregistration.pug', {
        errors,
        username,
        email,
        device,
        password,
        cpassword,
      });
    }
  });
  registration.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.push({ msg: 'Email already exists!' });
      res.render('devregistration.pug', {
        errors,
        username,
        device,
        email,
        password,
        cpassword,
      });
    } else {
      const newLocal = 10;
      var userData = new registration(req.body);
      req.body.password = bcrypt.hashSync(req.body.password, newLocal);
      const today = new Date();
      (userData.username = req.body.username),
        (userData.email = req.body.email),
        (userData.device = req.body.device),
        (userData.password = req.body.password),
        (userData.date = today);
      userData.usertype = 'developer';
      userData
        .save()
        .then(() => {
          req.flash('success_msg', 'User registered! , try Logging-in :)');
          res.redirect('/devregistration');
        })
        .catch(() => {
          req.flash('error_msg', 'Sorry, User not registered! :(');
          res.redirect('/devregistration');
        });
    }
  });
});

// Login
application.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: 'back',
    failureRedirect: '/loginfailure',
    failureFlash: true,
  })(req, res, next);
});
application.get('/profile', (req, res) => {
  var decoded = jwt.verify(
    req.headers['authorization'],
    process.env.SECRET_KEY
  );
  registration
    .findOne({
      _id: decoded._id,
    })
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.send('User does not exist');
      }
    })
    .catch((err) => {
      res.send('error:' + err);
    });
});

module.exports = application;
