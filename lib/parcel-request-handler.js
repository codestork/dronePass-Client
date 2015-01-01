var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var Parcel = require('../db/models/parcelData');
var ParcelCollection = require('../db/collections/parcelDataCollection');
var planner = require('../lib/dronePlannerQueries');

exports.registerAddress = function (){

  util.getUserFromToken(req, function (authUser) {
    if (authUser) {
      var user_id = authUser.id;
    } else {
      res.status(404).end('invalid user')
    }
  });

  var plannerData = planner.registerAddress(coordinates, user_id)

    ///get parcel GID, GID, lot geom, restriction height, srid
      var parcel_gid = plannerData.parcel_gid
      var gid = plannerData.gid
      var lot_geom = plannerData.lot_geom
      var restriction_height = plannerData.restriction_height
      var srid = plannerData.srid

  new Parcel({'parcel_gid': parcel_gid})
    .fetch()
    .then(function(parcel) {
      if (!parcel) {
        var newParcel = new ParcelData({
          parcel_gid: parcel_gid,
          gid: gid,
          lot_geom: lot_geom,
          restriction_height: restriction_height,
          srid: srid
        })
        newParcel.save().then(function(newParcel) {
            res.json(newParcel);
            ParcelCollection.add(newParcel);
        });
      } else {
        res.status(404).end('invalid parcel');
      }
    });
};