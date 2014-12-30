var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var Q = require('q')
var User = require('../db/models/user.js');
var db = require('../db/config');
var Users = require('../db/collections/users');

jwt  = require('jwt-simple');

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
            var token = jwt.encode(user, 'secret');
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
                  var token = jwt.encode(user, 'secret');
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
    console.log('signed out')
    res.json({token: null});
    res.end('Session over');
  });
};

