var bcrypt = require('bcrypt');
var path = require('path');
var util = require('../lib/utility');
var Parcel = require('../db/models/parcelData');
var ParcelCollection = require('../db/collections/parcelDataCollection');
var planner = require('../lib/dronePlannerRequests');
var Exception = require('../db/models/restrictionException');
var ExceptionCollection = require('../db/collections/restrictionExceptions');

exports.registerAddress = function (req, res){
  
  util.getUserFromToken(req, function (authUser) {
    if (!authUser) {
      console.log('not auth')
      return res.status(404).end('invalid user');
    }
    var user_id = authUser.attributes.user_id;
    
    planner.registerAddress(req.body, user_id, function (plannerData) {
      plannerData = plannerData[0];
      console.log(plannerData)
      var parcel_gid = plannerData.parcel_gid;
      var gid = plannerData.gid;
      var lot_geom = JSON.stringify(plannerData.lot_geom);
      var restriction_height =  0;
      var address = req.body.address;
      var restriction_start_time = req.body.restriction_start_time || null;
      var restriction_end_time = req.body.restriction_end_time || null;
      new Parcel({'parcel_gid': parcel_gid})
        .fetch()
        .then(function(parcel) {
          if (!parcel) {
            var newParcel = new Parcel({
              gid: gid,
              user_id: user_id,
              lot_geom: lot_geom,
              parcel_gid: parcel_gid,
              restriction_height: restriction_height,
              address: address,
              restriction_start_time: restriction_start_time,
              restriction_end_time: restriction_end_time
            })
            newParcel.save().then(function(newParcel) {
                ParcelCollection.add(newParcel);
                res.json(newParcel);
            });
          } else {
            res.status(404).end('invalid parcel');
          }
        });
    });
  });
};

exports.removeAddress = function (req, res) {
  var gid = req.url.split('/')[2];
  new Parcel({'gid': gid}).fetch().then(function(parcel){
      if (!parcel) {
        res.status(404).end('Failure to find parcel');
      } else {
          planner.removeAddress(gid, function (success) {
            Parcel.where({'gid': gid}).destroy().then(function() {
              res.status(200).end('success')
            });
          });
      }
  });
};

exports.getRegisteredAddresses = function (req, res){

  util.getUserFromToken(req, function (authUser) {
    if (authUser) {
      var user_id = authUser.id;
      new Parcel({'user_id': user_id})
        .fetchAll()
        .then(function(parcels) {
          if (!parcels) {
            res.status(200).end('no parcels attacked to this user');
          } else {
            res.json(parcels);
          }
        });
    } else {
      return res.status(404).end('invalid user');
    }
  });
};

exports.togglePermissions = function (req, res) {
  var parcel_gid = req.body.parcel_gid;
  var restriction_start_time = req.body.restriction_start_time;
  var restriction_end_time = req.body.restriction_end_time;
  console.log(parcel_gid);
  new Parcel({'parcel_gid': parcel_gid}).fetch().then(function(parcel){
      if (!parcel) {

        res.status(404).end('Failure to find parcel');
      } else {
          parcel.set({restriction_start_time: restriction_start_time,
                            restriction_end_time: restriction_end_time});
                             return res.json(parcel);
          // planner.togglePermissions(parcel_gid, {
          //   restriction_start_time: restriction_start_time,
          //   restriction_end_time: restriction_end_time
          // }, function (success) {
          //   parcel.set({restriction_start_time: restriction_start_time,
          //                   restriction_end_time: restriction_end_time})
          //                   .then(function () {res.json(parcel)});
          // })       
        }
  });
};

//[ToDo: V2 - flight exceptions for dronePath]
exports.setException = function (req, res) {
  var parcel_gid = req.body.parcel_gid;
  var exception_start_time = req.body.exception_start_time;
  var exception_end_time = req.body.exception_end_time;
  var drone_id = req.body.drone_id;


  planner.setException(req.body, function (exception_id) {  
    new Exception({'exception_id': exception_id})
      .fetch()
      .then(function(exception) {
        if (!exception) {
          var newException = new Parcel({
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
  })
};

exports.removeException = function (req, res) {
  var exception_id = req.body.exception_id;
  new Exception({'exception_id': exception_id}).fetch().then(function(exception){
      if (!exception) {
        res.status(404).end('Failure to find exception');
      } else {
          planner.removeException(exception_id, function (success) {
            exception.destroy().then(function() {
              res.status(200).end('success')
            });
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
