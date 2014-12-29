var db = require('../config.js');
var bcrypt = require('bcrypt');
var bluebird = require('bluebird');

var RestrictionExceptionss = db.Model.extend({
  tableName: 'parcelData',
  defaults: {
    // enter default values here
  }
});

module.exports = RestrictionExceptions;
