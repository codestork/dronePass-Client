var db = require('../config.js');
var bcrypt = require('bcrypt');
var bluebird = require('bluebird');
var User = require('../models/user');

var ParcelData = db.Model.extend({
  tableName: 'parcelData',
  defaults: {
    restriction_height: 200
  },
  user_id: function() {
    return this.belongsTo(User);
  }
});

module.exports = ParcelData;
