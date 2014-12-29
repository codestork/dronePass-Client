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
    this.on('fetching', function () {console.log('hello')})
    this.on('fetched', function () {console.log('goodbye')})
    this.on('creating', this.hashPassword);
    this.on('creating', this.saltPassword);
  },

  comparePassword: function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  },

  hashPassword: function(){
    var cipher = Promise.promisify(bcrypt.hash);
    // return a promise - bookshelf will wait for the promise
    // to resolve before completing the create action
    return cipher(this.get('password'), null, null)
      .bind(this)
      .then(function(hash) {
        this.set('password', hash);
      });
  },

  saltPassword: function(){
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) {
        throw err;
      }
      this.set('salt', salt);
    });
  }

});

module.exports = User;
