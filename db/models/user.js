var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var db = require('../config.js');
var Q = require('q');
var saltWorkFactor = 10;



var User = db.Model.extend({
  tableName: 'users',

  defaults: {
    owner_authority: 0
  },

  comparePassword: function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  },

});

module.exports = User;

// hashPassword: function(password){
//   var newPass;
//   bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash(password, salt, function(err, hash) {
//       console.log(hash)
//       newPass = hash;
//     });
//   });
//   return newPass;
// }