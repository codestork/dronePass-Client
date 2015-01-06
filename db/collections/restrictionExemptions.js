var db = require('../config');
var RestrictionExemption = require('../models/restrictionExemption');

var RestrictionExemptions = new db.Collection();

RestrictionExemptions.model = RestrictionExemption;

module.exports = RestrictionExemptions
