var db = require('../config.js');
var bcrypt = require('bcrypt');
var bluebird = require('bluebird');

var ParcelData = db.Model.extend({
  tableName: 'parcelData',
  defaults: {
    restriction_height: 200
  }
});

module.exports = ParcelData;
