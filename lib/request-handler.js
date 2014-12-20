var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var User = require('../db/models/user.js');

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.end("Session over");
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err,user) {
      if (!user) {
        res.status(404);
      } else {
        var savedPassword = user.password;
        User.comparePassword(password, savedPassword, function(err, match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.status(200);
          }
        });
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(err, newUser) {
          if (err) {
            res.send(500, err);
          }
          util.createSession(req, res, newUser);
        });
      } else {
        console.log('Account already exists');
        res.status(404);
      }
    });
};
