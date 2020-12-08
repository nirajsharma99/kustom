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
const ysltemplate = require('./models/deviceTemplates');
const postTemplate = require('./models/postTemplates');
const searchTag = require('./models/searchTag');
//----------------------view engine-----------------
application.set('view engine', 'pug');
application.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, '/views/homepage'),
]);
//--------------------------------------------------

//-------------------------------------------------------------------------
application.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/user',
  collection: 'mySessions',
});

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
//-------------------------------------------------------------------------

//----------------------multer--------------------------------
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname + '/static/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now() + '.jpg');
  },
});
var upload = multer({ storage: storage });
//----------------------------------------------------------------

//-------------------------------routes for comments-------------------------------------------------------------------
application.get('/api/comments', (req, res) => {
  Comment.find().then(function (comments) {
    res.send(comments);
  });
});

application.post('/api/comments', (req, res) => {
  const comment = new Comment({
    username: req.body.username,
    usertype: req.body.usertype,
    comment: req.body.comment,
    filename: req.body.filename,
  });
  comment.save().then((response) => {
    res.send(response);
  });
});

//routes for replies
application.post('/api/replies', (req, res) => {
  const IDpassed = req.body.objectId;
  const newreplies = {
    _id: new ObjectID(),
    comment_id: req.body.objectId,
    reply: req.body.reply,
    username: req.body.username,
    usertype: req.body.usertype,
    filename: req.body.filename,
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
      { _id: objid(objectId) },
      { $pull: { replies: { _id: objid(replyId) } } }
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
//--------------------------------------------comment section ends-----------------------------------------------------------------------------

//----------------------------------------------------------projects/templates-------------------------------------------
application.get('/api/ysltemplates', (req, res) => {
  ysltemplate.find().then(function (templates) {
    res.send(templates);
  });
});
application.post(
  '/addtemplate',
  upload.fields([
    { name: 'myFile' },
    /*{ name: 'rompic' },
    { name: 'aboutpic' },
    { name: 'featurepic' },
    { name: 'screenshots', maxCount: 6 },
    { name: 'linkpic' },
    { name: 'installationpic' },
    { name: 'teampic' },
    { name: 'sourcepic' },*/
  ]),
  (req, res) => {
    //console.log(req.files.screenshots);
    /*var x = [];
    for (i = 0; i < 6; i++) {
      x[i] = req.files.screenshots[i].filename;
    }
    console.log(x);*/
    const template = new ysltemplate({
      username: req.body.username,
      joindate: req.body.joiningdate,
      projectname: req.body.romname,
      androidversion: req.body.androidversion,
      romversion: req.body.romversion,
      device: req.body.device,
      romtype: req.body.romtype,
      updatetype: req.body.updatetype,
      developerpicture: req.body.userimage,
      filename: req.files.myFile[0].filename,
      content: req.body.contentpass,
    });
    template.save().then((response) => {
      res.send(response);
    });
  }
);
application.post('/api/deleteproject', (req, res) => {
  const ID = req.body.objectId;
  ysltemplate
    .findOneAndRemove({ _id: objid(ID) })
    .then(() => {
      console.log('Project deleted');
    })
    .catch((err) => {
      console.log(err);
    });
});
//----star rating----
application.post('/api/starRating', (req, res) => {
  rate = parseInt(req.body.rating);
  projectname = req.body.projectname;
  romversion = req.body.romversion;
  device = req.body.device;
  const newrater = { rated: rate, username: req.body.username };
  console.log(rate + projectname + romversion + device);
  ysltemplate
    .update(
      { projectname: projectname, romversion: romversion, device: device },
      { $push: { raters: newrater } }
    )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});

//----------------------------------------------- projects/templates ends here----------------------------------------------------

//------------------------------------------------manage users------------------------------------------------------
application.get('/api/users', (req, res) => {
  registration.find().then(function (users) {
    res.send(users);
  });
});
application.get(`/getprofile`, (req, res) => {
  const username = req.query.userprofile;
  registration
    .findOne({ username: username })
    .then((userInfo) => {
      res.render('profile.pug', { userInfo: userInfo, user: req.user });
    })
    .catch((err) => {
      console.log(err);
    });
});
application.post('/api/deleteuser', (req, res) => {
  const ID = req.body.objectId;
  registration
    .findOneAndRemove({ _id: objid(ID) })
    .then(() => {
      console.log('User deleted');
    })
    .catch((err) => {
      console.log(err);
    });
});
application.post('/api/deleteAccount', (req, res) => {
  const user = req.query.user;
  const pass = req.body.password;
  console.log(user + '' + pass);
  registration.findOne({ username: user }).then((data) => {
    var decide = new Boolean();
    decide = bcrypt.compareSync(pass, data.password);
    if (Boolean(decide) === true) {
      registration.findOneAndRemove({ username: user }).then(() => {
        res.redirect('/manageHomepage');
        req.flash('success_msg', 'Account deleted!!');
      });
    } else if (Boolean(decide) === false) {
      req.flash('error_msg', 'Wrong password!!');
      res.redirect('back');
    }
  });
});

//---------------------------------------------manage user ends here--------------------------------------------------------

const { ObjectID } = require('mongodb');
const { fail } = require('assert');
const { stringify } = require('querystring');

//----------------------------------------------------POSTS---------------------------------------------------------------
application.get(`/posts`, (req, res) => {
  const post = req.query.post;
  postTemplate
    .findOne({ postname: post })
    .then((postInfo) => {
      res.render('posts.pug', { postInfo: postInfo, user: req.user });
    })
    .catch((err) => {
      console.log(err);
    });
});
application.get('/api/posttemplates', (req, res) => {
  postTemplate.find().then(function (templates) {
    res.send(templates);
  });
});
application.post(
  '/addPostTemplate',
  upload.fields([
    { name: 'myFile' },
    { name: 'myFile2' },
    { name: 'authorpic' },
  ]),
  (req, res) => {
    var postname = req.body.postname;
    postname = postname.replace(/ /g, '-');
    const template = new postTemplate({
      author: req.body.author,
      authorportfolio: req.body.authorPortfolio,
      date: Date.now(),
      postindex: req.body.postnumber,
      heading: req.body.heading,
      postname: postname,
      description: req.body.description,
      thumbnailfilename: req.files.myFile[0].filename,
      postpicfilename: req.files.myFile2[0].filename,
      authorpicfilename: req.files.authorpic[0].filename,
      purpose: req.body.purpose,
      content: req.body.contentpass,
      authortwitter: req.body.authorTwitter,
      authorinstagram: req.body.authorInstagram,
    });
    const index = parseInt(req.body.postnumber);
    const author = req.body.author;
    const authorportfolio = req.body.authorPortfolio;
    const heading = req.body.heading;
    const description = req.body.description;
    const thumbnailfilename = req.files.myFile[0].filename;
    const postpicfilename = req.files.myFile2[0].filename;
    const authorpicfilename = req.files.authorpic[0].filename;
    const purpose = req.body.purpose;
    const content = req.body.contentpass;
    const authortwitter = req.body.authorTwitter;
    const authorinstagram = req.body.authorInstagram;
    if (req.body.purpose == 'Add') {
      template.save().then((response) => {
        req.flash('success_msg', 'Success, Post Template Added!!)');
        res.redirect('/manageHomepage');
      });
    } else if (req.body.purpose == 'Update') {
      postTemplate.collection
        .findOneAndUpdate(
          { postindex: index },
          {
            $set: {
              author: author,
              authorportfolio: authorportfolio,
              authortwitter: authortwitter,
              authorinstagram: authorinstagram,
              postindex: index,
              heading: heading,
              postname: postname,
              description: description,
              thumbnailfilename: thumbnailfilename,
              postpicfilename: postpicfilename,
              authorpicfilename: authorpicfilename,
              purpose: purpose,
              content: content,
            },
          }
        )
        .then(() => {
          req.flash('success_msg', 'Success, Post Template Updated!!)');
          res.redirect('/manageHomepage');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
);
//-----------------------------------------------------posts ends--------------------------------------------------------

//------------------------------------------------------------------searchTag---------------------------------------------------------------
application.get('/api/searchTags', (req, res) => {
  searchTag.find().then(function (tags) {
    res.send(tags);
  });
});
application.post('/addSearchTag', (req, res) => {
  const tag = new searchTag({
    link: req.body.taglink,
    date: Date.now(),
    heading: req.body.heading,
    description: req.body.description,
  });
  console.log(req.body.taglink + req.body.heading + req.body.description);
  tag.save().then((response) => {
    req.flash('success_msg', 'Success, Search tag Added!!)');
    res.redirect('/manageSearchTags');
  });
});
//-----------------------------------------------------------------------searchTag ends here--------------------------------------

//-------------------------------------------------------------------update requests-------------------------------------------------
application.post('/changepassword', (req, res) => {
  const user = req.query.user;
  const oldPassword = req.body.oldpassword;
  var newPassword = req.body.password;
  registration.findOne({ username: user }).then((data) => {
    var decide = new Boolean(true);
    decide = bcrypt.compareSync(oldPassword, data.password);
    if (Boolean(decide) === false) {
      req.flash('error_msg', 'Existing password incorrect!!)');
      res.redirect('back');
    } else if (Boolean(decide) === true) {
      newPassword = bcrypt.hashSync(newPassword, 10);
      registration
        .findOneAndUpdate({ username: user }, { password: newPassword })
        .then(() => {
          req.flash('success_msg', 'Success, password changed!!)');
          res.redirect('back');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});
application.post(
  '/profileEditRequest',
  upload.single('realFile'),
  (req, res) => {
    const objID = req.body.id;
    const name = req.body.name;
    const city = req.body.city;
    const country = req.body.country;
    const occupation = req.body.occupation;
    const telegram = req.body.telegram;
    const instagram = req.body.instagram;
    const paypal = req.body.paypal;
    const gpay = req.body.gpay;
    const device = req.body.devices;
    //const filename = req.file.filename || null;
    registration
      .findByIdAndUpdate(
        { _id: objID },
        {
          name: name,
          city: city,
          country: country,
          occupation: occupation,
          telegram: telegram,
          instagram: instagram,
          paypal: paypal,
          gpay: gpay,
          device: device,
          //filename: filename,
        }
      )
      .then((response) => {
        req.flash('success_msg', 'User Profile Updated!!)');
        res.redirect('/editprofile');
        console.log('User Profile Updated');
      })
      .catch((err) => {
        req.flash('error_msg', 'Please select a file to upload!)');
        res.redirect('/editprofile');
        //console.log(err);
      });
  }
);
application.post(
  '/profilePictureUpdate',
  upload.single('myFile'),
  (req, res) => {
    const ID = req.body.id;
    const filename = req.file.filename;
    registration
      .findByIdAndUpdate({ _id: objid(ID) }, { filename: filename })
      .then(() => {
        req.flash('success_msg', 'Profile Picture Updated!!)');
        res.redirect('/editprofile');
        console.log('profile picture updated');
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

//-------------------------------------------update request ends here------------------------------------------------

//-------------------------------------------------get request for pages-------------------------------------------------
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
application.get('/security', ensureAuthenticated, (req, res) => {
  res.status(200).render('security.pug');
});

application.get('/addproject', ensureAuthenticated, (req, res) => {
  res.status(200).render('addproject.pug');
});
application.get('/editprofile', ensureAuthenticated, (req, res) => {
  res.status(200).render('editprofile.pug');
});

application.get('/adminLogin', (req, res) => {
  res.status(200).render('adminLogin.pug');
});

application.get('/manageSearchTags', ensureAuthenticated, (req, res) => {
  if (req.user.usertype == 'admin') {
    res.render('manageSearchTags.pug', (user = req.user));
  } else {
    req.flash(
      'error_msg',
      'Authorisaton denied! Only Admin has access to this!'
    );
    res.redirect('/adminLogin');
  }
});
application.get('/manageAdmin', ensureAuthenticated, (req, res) => {
  if (req.user.usertype == 'admin') {
    res.render('manageAdmin.pug', (user = req.user));
  } else {
    req.flash(
      'error_msg',
      'Authorisaton denied! Only Admin has access to this!'
    );
    res.redirect('/adminLogin');
  }
});

application.get('/manageProjects', ensureAuthenticated, (req, res) => {
  if (req.user.usertype == 'admin') {
    res.render('manageProjects.pug', (user = req.user));
  } else {
    req.flash(
      'error_msg',
      'Authorisaton denied! Only Admin has access to this!'
    );
    res.redirect('/adminLogin');
  }
});

application.get('/manageHomepage', ensureAuthenticated, (req, res) => {
  if (req.user.usertype == 'admin') {
    res.render('manageHomepage.pug', (user = req.user));
  } else {
    req.flash(
      'error_msg',
      'Authorisaton denied! Only Admin has access to this!'
    );
    res.redirect('/adminLogin');
  }
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
application.get('/havocOs-ysl', (req, res) => {
  res.status(200).render('havocOs-ysl.pug');
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
application.get('/posts', (req, res) => {
  res.status(200).render('posts.pug');
});

application.get('/logout', (req, res) => {
  req.logOut();
  req.session.destroy();
  res.redirect('/');
});
//------------------------------------------------------------------------------------------------------------------------
const server = application.listen('3000', () => {
  console.log('server started');
});

//------------------------------------------------------------SOCKET----------------------------------------------------------
let io = require('socket.io')(server);
io.on('connection', (socket) => {
  console.log(`New Connection: ${socket.id}`);
  // Recieve event
  socket.on('comment', (data) => {
    console.log(data);
    data.time = Date();
    socket.broadcast.emit('comment', data);
  });
  socket.on('reply', (replyData) => {
    console.log(replyData);
    //replyData.time = Date();
    socket.broadcast.emit('reply', replyData);
  });
});
//------------------------------------------------------socket ends here-----------------------------------------------------------

//-----------------------------------------------------admin----------------------------------------------------------------
application.post('/adminRegistration', (req, res) => {
  const { username, email, name, password, cpassword } = req.body;
  //console.log(req.body.emailId);
  let errors = [];
  registration.findOne({ username: req.body.username }).then((user) => {
    if (user) {
      errors.push({ msg: 'Username already exist!' });
      res.render('adminLogin.pug', {
        errors,
        username,
        name,
        email,
        password,
        cpassword,
      });
    }
  });
  registration.findOne({ email: req.body.emailId }).then((user) => {
    if (user) {
      errors.push({ msg: 'Email already exists!' });
      res.render('adminLogin.pug', {
        errors,
        username,
        name,
        email,
        password,
        cpassword,
      });
    } else {
      const newLocal = 10;
      var userData = new registration(req.body);
      req.body.newpassword = bcrypt.hashSync(req.body.newpassword, newLocal);
      const today = new Date();
      (userData.username = req.body.username),
        (userData.name = req.body.name),
        (userData.email = req.body.emailId),
        (userData.password = req.body.newpassword),
        (userData.usertype = 'admin'),
        (userData.date = today),
        userData
          .save()
          .then(() => {
            req.flash('success_msg', 'User registered!, try Logging-in :)');
            res.redirect('/adminLogin');
          })
          .catch(() => {
            req.flash('error_msg', 'Sorry, User not registered! :(');
            res.redirect('/adminLogin');
          });
    }
  });
});

application.get('/admin', ensureAuthenticated, (req, res) => {
  if (req.user.usertype == 'admin') {
    res.render('admin.pug', (user = req.user));
  } else {
    req.flash(
      'error_msg',
      'Authorisaton denied! Only Admin has access to this!'
    );
    res.redirect('/adminLogin');
  }
});

application.post('/adminsLogin', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/loginfailure',
    failureFlash: true,
  })(req, res, next);
});
//------------------------------------------------------------admin ends--------------------------------------------------

//------------------------------------------------------------user registration------------------------------------------------
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
//---------------------------------------------------user registration ends--------------------------------------------

//--------------------Login---------------------------------------------
application.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: 'back',
    failureRedirect: '/loginfailure',
    failureFlash: true,
  })(req, res, next);
});

module.exports = application;
