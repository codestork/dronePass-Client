var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var User = require('../db/models/user');
var Users = require('../db/collections/users');
var admin = require('../lib/droneAdminRequests');
var jwt  = require('jsonwebtoken');


exports.signinUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // checks whether user exists in database, then sends back JSON webtoken (encrypted)
  // for client to store in localStorage
  new User({'username': username}).fetch().then(function(user){
      if (!user) {
        res.status(404).end('Incorrect Username or Password');
      } else {
        user.comparePassword(password, function(err, match) {
          if (match) {
            var token = jwt.sign(user, 'secret');
            res.json({token: token});
          } else {
            res.status(404).end('Incorrect Username or Password');
          }
        });
      }
  });
};


exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;

  // Checks for existing username in database
  // if doesn't exist, salts and hashes password, then sends back JSON webtoken
  new User({'username': username})
    .fetch()
    .then(function(existingUser) {
      if (existingUser) {
        return res.status(404).end('Account already exists. Please sign in with a different email.');
      } else {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
            var newUser = new User({
              username: username,
              password: hash,
              name: name
            });
            newUser.save().then(function(newUser) {
                var token = jwt.sign(newUser, 'secret');
                Users.add(newUser);
                admin.registerUser(newUser, function (err, status, adminResponse) {
                  if (err || adminResponse.name ==='error') {
                    console.log('made it');
                    // if Drone Admin is unable to receive user, the saved model is destroyed
                    newUser.where({'id': newUser.id}).destroy().then(function () {
                      return res.status(404).end('Unable to register user in database');
                    });
                  } 
                  console.log('success');
                  // else, sends back token to client to store in localStorage
                  res.json({token: token});
                });
            });
          });
        });
      } 
    });
};

// This is an extra precaution
// Signout happens on clientside with removal of JSON webtoken
exports.signoutUser = function (req, res) {
  res.status(200).end('successfull logout');
};

exports.removeUser = function (req, res) {
  util.getUserFromToken(req, function (authUser) {
    if (!authUser) {
      res.status(404).end('User does not exist');
    } else {
        new User({'username': authUser.username}).fetch().then(function(user){
            if (!user) {
              res.status(404).end('Unable to remove user');
            } else {
              user.comparePassword(password, function(match) {
                if (match) {
                    admin.removeUser(user.id, function (err, status, adminResponse) {
                      if (err || adminResponse.name === 'error') {
                        res.status(404).end('Unable to remove user');
                      } else {
                        user.where({'id': user.id}).destroy().then(function() {
                          res.status(200).end('success');
                        });
                      }
                    });
                } else {
                  res.status(404).end('Unable to remove user');
                }
              });
            }
        });
    } 
  });
};

// for requests on client side involving restricted areas
exports.checkAuthentication = function (req, res) {
  util.getUserFromToken(req, function (authUser) {
    if (authUser) {
      res.status(200).end('Valid webtoken and user');
    } else {
      res.status(404).end('User is not authorized to perform this action');
    }
  });
};
