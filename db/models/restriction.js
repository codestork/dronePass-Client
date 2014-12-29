var db = require('../config.js');
var bcrypt = require('bcrypt');
var bluebird = require('bluebird');

var Restrictions = db.Model.extend({
  tableName: 'parcelData',
  defaults: {
    // enter default values here
  }
});

module.exports = Restrictions;
