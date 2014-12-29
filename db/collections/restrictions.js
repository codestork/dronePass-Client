var db = require('../config');
var Restriction = require('../models/restriction');

var Restrictions = new db.Collection();

Restrictions.model = Restriction;

module.exports = Restrictions;
