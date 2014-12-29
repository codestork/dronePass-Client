var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var db = require('../config.js');
var Q = require('q');
var SALT_WORK_FACTOR  = 10;


var User = db.Model.extend({
  tableName: 'users',

  defaults: {
    owner_authority: 0
  },

  initialize: function(){
    this.on('creating', this.hashPassword);
    this.on('creating', this.saltPassword);
  },

  comparePassword: function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  },

  hashPassword: function(password){
    var model = this;
    bcrypt.hash(password, null, null, function(err, hash) {
      model.set('password',hash)
    });
  },

  saltPassword: function(passowrd){
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) {
        throw err;
      }
      // this.set('salt', salt);
    });
  }

});

module.exports = User;
