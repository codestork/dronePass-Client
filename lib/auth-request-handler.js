var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var User = require('../db/models/user');
var Users = require('../db/collections/users');
var planner = require('../lib/dronePlannerQueries');
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
                  Users.add(newUser);
                  planner.registerUser(newUser);
                });
         });
        })
        
      } else {
        res.status(404).end('Account already exists');
      }
    })
};

exports.signoutUser = function (req, res) {
  res.status(200).end('successfull logout')
};

exports.checkAuth = function (req, res) {
  util.getUserFromToken(req, function (authUser) {
    if (authUser) {
      res.status(200).end('Valid webtoken and user')
    } else {
      res.status(404).end('invalid user')
    }
  });
};
