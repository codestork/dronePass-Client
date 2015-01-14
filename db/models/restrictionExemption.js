var db = require('../config.js');
var bcrypt = require('bcrypt');
var bluebird = require('bluebird');
var Parcel = require('../models/parcelData.js')

var RestrictionExemption = db.Model.extend({
  tableName: 'parcelData',
  defaults: {
    // enter default values here
  },
  parcel_gid: function() {
    return this.belongsTo(Parcel);
  }
});

module.exports = RestrictionExemption;
