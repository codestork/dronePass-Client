var bcrypt = require('bcrypt');
var util = require('../lib/utility');
var Parcel = require('../db/models/parcelData');
var ParcelCollection = require('../db/collections/parcelDataCollection');
var planner = require('../lib/dronePlannerRequests');
var Exception = require('../db/models/restrictionException');
var ExceptionCollection = require('../db/collections/restrictionExceptions');

exports.registerAddress = function (req, res){

  util.getUserFromToken(req, function (authUser) {
    if (authUser) {
      var user_id = authUser.id;
    } else {
      return res.status(404).end('invalid user');
    }
  });

  var plannerData = planner.registerAddress(req.body, user_id)

    ///get parcel GID, GID, lot geom, restriction height
    var parcel_gid = plannerData.parcel_gid
    var gid = plannerData.gid
    var lot_geom = plannerData.lot_geom
    var restriction_height = plannerData.restriction_height
    var restriction_start_time = req.body.restriction_start_time
    var restriction_end_time = req.body.restriction_end_time

  new Parcel({'parcel_gid': parcel_gid})
    .fetch()
    .then(function(parcel) {
      if (!parcel) {
        var newParcel = new ParcelData({
          gid: gid,
          user_id: user_id,
          lot_geom: lot_geom,
          parcel_gid: parcel_gid,
          restriction_height: restriction_height,
          restriction_start_time: restriction_start_time,
          restriction_end_time: restriction_end_time
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

exports.removeAddress = function (req, res) {
  var gid = req.body.gid;
  new Parcel({'gid': gid}).fetch().then(function(parcel){
      if (!parcel) {
        res.status(404).end('Failure to find parcel');
      } else {
          planner.removeAddress(gid);
          parcel.destroy().then(function() {
            res.status(200).end('success')
          });
        }
  });
};

exports.getRegisteredAddresses = function (req, res){

  util.getUserFromToken(req, function (authUser) {
    if (authUser) {
      var user_id = authUser.id;
    } else {
      return res.status(404).end('invalid user');
    }
  });

  new Parcel({'user_id': user_id})
    .fetchAll()
    .then(function(parcels) {
      if (!parcels) {
        res.status(200).end('no parcels attacked to this user');
      } else {
        res.json(parcels);
      }
    });
};

exports.togglePermissions = function (req, res) {
  var parcel_gid = req.body.parcel_gid;
  var restriction_start_time = req.body.restriction_start_time;
  var restriction_end_time = req.body.restriction_end_time;

  new Parcel({'parcel_gid': parcel_gid}).fetch().then(function(parcel){
      if (!parcel) {
        res.status(404).end('Failure to find parcel');
      } else {
          planner.togglePermissions(parcel_gid, {
            restriction_start_time: restriction_start_time,
            restriction_end_time: restriction_end_time
          });
          parcel.customer.set({restriction_start_time: restriction_start_time,
                               restriction_end_time: restriction_end_time}).then(function () {
              res.json(parcel)
          })       
        }
  });
};

exports.setException = function (req, res) {
  var parcel_gid = req.body.parcel_gid;
  var exception_start_time = req.body.exception_start_time;
  var exception_end_time = req.body.exception_end_time;
  var drone_id = req.body.drone_id;
  var exception_id = planner.setException(req.body)


  new Exception({'exception_id': exception_id})
    .fetch()
    .then(function(exception) {
      if (!exception) {
        var newException = new ParcelData({
          exception_id: exception_id,
          drone_id: drone_id,
          parcel_gid: parcel_gid,
          exception_start_time: exception_start_time,
          exception_end_time: exception_end_time
        })
        newException.save().then(function(newException) {
            res.json(newException);
            ExceptionCollection.add(newException);
        });
      } else {
        res.status(404).end('invalid exception request');
      }
    });
};

exports.removeException = function (req, res) {
  var exception_id = req.body.exception_id;
  new Exception({'exception_id': exception_id}).fetch().then(function(exception){
      if (!exception) {
        res.status(404).end('Failure to find exception');
      } else {
          planner.removeException(exception_id);
          exception.destroy().then(function() {
            res.status(200).end('success')
          });
        }
  });
};

exports.getExceptions = function (req, res){
  var parcel_id = req.body.parcel_id;
  new Exception({'parcel_id': parcel_id})
    .fetchAll()
    .then(function(exceptions) {
      if (!exceptions) {
        res.status(200).end('no exceptions attacked to this user');
      } else {
        res.json(exceptions);
      }
    });
};
