var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var Q = require('q')
var User = require('../db/models/user.js');
var db = require('../db/config');
var Users = require('../db/collections/users');

jwt  = require('jwt-simple');

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  new User({ username: username}).fetch().then(function(user){
    console.log(user);
      if (!user) {
        res.status(404);
        res.end();
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            var token = jwt.encode(user, 'secret');
            res.json({token: token});
            util.createSession(req, res, user);
          } else {
            res.status(404);
            res.end();
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  
  new User({'username': username})
  .fetch()
  .then(function(user) {
      if (!user) {
        console.log('new user')
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save()
          .then(function(newUser) {
            var token = jwt.encode(user, 'secret');
            res.json({token: token});
            util.createSession(req, res, newUser);
            Users.add(newUser);
          });
      } else {
        console.log('Account already exists');
        res.status(404);
        res.end();
      }
    })
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
      var user = jwt.decode(token, 'secret');
      var findUser = Q.nbind(User.findOne, User);
      findUser({username: user.username})
        .then(function (foundUser) {
          if (foundUser) {
            res.send(200);
            res.end();
          } else {
            res.send(401);
            res.end();
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }

//[ToDo]: Figure out how to logout user on server end
exports.logoutUser = function (req, res) {
  req.session.destroy(function () {
    res.json({token: null});
    res.end('Session over');
  });
};

