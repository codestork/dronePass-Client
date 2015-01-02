var db = require('../config');
var RestrictionException = require('../models/restrictionException');

var RestrictionExceptions = new db.Collection();

RestrictionExceptions.model = RestrictionException;

module.exports = RestrictionExceptions
