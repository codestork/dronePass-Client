var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var bluebird = require('bluebird');
var Q        = require('q');
var SALT_WORK_FACTOR  = 10;

var ParcelSchema = mongoose.Schema({
  ownerid : {type: Number, required: true, index {unique: true} },
  parcelID : {type: Number, required: true },
  lot_geom: {type: Array},
  restriction_height : {type: Number default: 200}
  srid: {}
  parcel: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  salt: { type: String},
  permission: {type: Number, required: true, default: 0}
});


module.exports = mongoose.model('landParcels', ParcelSchema);


