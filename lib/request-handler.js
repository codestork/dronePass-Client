var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var Q = require('q')
var User = require('../db/models/user.js');
var db = require('../db/config');
var Users = require('../db/collections/users');
var jwt  = require('jwt-simple');

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
    res.json({token: null});
    res.end('Session over');
  });
};


// checkAuth: function (req, res, next) {
//   // checking to see if the user is authenticated
//   // grab the token in the header is any
//   // then decode the token, which we end up being the user object
//   // check to see if that user exists in the database
//   var token = req.headers['x-access-token'];
//   if (!token) {
//     next(new Error('No token'));
//   } else {
//     var user = jwt.decode(token, 'secret');
//     var findUser = Q.nbind(User.findOne, User);
//     findUser({username: user.username})
//       .then(function (foundUser) {
//         if (foundUser) {
//           res.send(200);
//         } else {
//           res.send(401);
//         }
//       })
//       .fail(function (error) {
//         next(error);
//       });
//   }
// }

