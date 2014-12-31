var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var Q = require('q')
var User = require('../db/models/user.js');
var db = require('../db/config');
var Users = require('../db/collections/users');
var jwt  = require('jsonwebtoken');

exports.signinUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({'username': username}).fetch().then(function(user){
      if (!user) {
        res.status(404);
        res.end('Failure to find users table');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            var token = jwt.sign(user, 'secret');
            // this creates a token for the user that is sent back to the server
            res.json({token: token});
            util.createSession(req, res, user);
          } else {
            res.status(404);
            res.end('incorrect Password or Username');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;
  
  new User({'username': username})
    .fetch()
    .then(function(user) {
      if (!user) {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
              var newUser = new User({
                username: username,
                password: hash,
                name: name
              })
              newUser.save().then(function(newUser) {
                  var token = jwt.sign(newUser, 'secret');
                  res.json({token: token});
                  console.log(newUser)
                  util.createSession(req, res, newUser);
                  Users.add(newUser);
                });
         });
        })
        
      } else {
        console.log('Account already exists');
        res.status(404);
        res.end();
      }
    })
};

exports.signoutUser = function (req, res) {
  req.session.destroy(function () {
    res.json({token: null});
    res.end('Session over');
  });
};


exports.checkAuth = function (req, res, next) {
  // checking to see if the user is authenticated
  // grab the token in the header is any
  // then decode the token, which we end up being the user object
  // check to see if that user exists in the database

  var token = req.headers['x-access-token'];
  if (!token) {
    next(new Error('No token'));
  } else {
    jwt.verify(token, 'secret', function(err, decoded) {
      if (err || !decoded) {
        console.log('err or decoded')
        res.status(404).end('invalid webtoken')
      } else {
        console.log(decoded.username)
          new User({'username': decoded.username})
              .fetch()
              .then(function(userFound) {
                if(userFound) {
                  console.log(userFound);
                  res.status(200).end('Valid webtoken and user')
                } else {
                  console.log(userFound)
                  res.status(404).end('invalid user')
                }
            });;
      }
    });
  }
};

