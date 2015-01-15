var bcrypt = require('bcrypt');
var db = require('../config.js');
var saltWorkFactor = 10;



var User = db.Model.extend({
  tableName: 'users',

  defaults: {
    owner_authority: 0
  },

  comparePassword: function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(err, isMatch);
    });
  },

});

module.exports = User;