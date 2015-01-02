var db = require('../config');
var ParcelData = require('../models/parcelData');

var ParcelDataCollection = new db.Collection();

ParcelData.model = ParcelData;

module.exports = ParcelDataCollection;
