var bcrypt = require('bcrypt');
var path = require('path');
var util = require('../lib/utility');
var Parcel = require('../db/models/parcelData');
var ParcelCollection = require('../db/collections/parcelDataCollection');
var planner = require('../lib/dronePlannerRequests');
var Exception = require('../db/models/restrictionException');
var ExceptionCollection = require('../db/collections/restrictionExceptions');

var x = 1
exports.registerAddress = function (req, res){

  util.getUserFromToken(req, function (authUser) {
    if (!authUser) {
      return res.status(404).end('invalid user');
    }
    var user_id = authUser.id;
    
    x++;
    planner.registerAddress(req.body.coordinates, user_id, function (plannerData) {
      var parcel_gid = x || plannerData.parcel_gid;
      var gid = x || plannerData.gid;
      var lot_geom = JSON.stringify({"type":"MultiPolygon","coordinates":[[[[-122.061273899269,37.6605008712443],[-122.062585929113,37.6597995153016],[-122.062872922999,37.659645659931],[-122.063472540079,37.660311002651],[-122.063600526461,37.6602358258972],[-122.064832666411,37.6595155916639],[-122.064921489553,37.6595497749243],[-122.065872420281,37.6599154972128],[-122.066003048124,37.6599659476129],[-122.066718869064,37.6602413997261],[-122.06681116965,37.6602765659951],[-122.067661109557,37.6606037862537],[-122.067753418769,37.6606392978022],[-122.067847425642,37.6606734101915],[-122.06794140411,37.6607061498954],[-122.068035360949,37.660737859461],[-122.068131015504,37.6607681729971],[-122.068240545038,37.6608010486243],[-122.068247496956,37.6608030160103],[-122.06415502086,37.6630270758828],[-122.064001823376,37.6628893692201],[-122.063956741003,37.6628813848533],[-122.063652058938,37.662769724763],[-122.063538879616,37.662727622972],[-122.063387461451,37.6625922955807],[-122.063094041626,37.6625230600169],[-122.063061244384,37.6624421218446],[-122.062949482539,37.6622207743084],[-122.06280591932,37.6621303204095],[-122.062664087631,37.6620401863377],[-122.062218713564,37.6616450698287],[-122.061684154443,37.6608693334283],[-122.061577443639,37.6606413939132],[-122.061273899269,37.6605008712443]]]]})|| plannerData.lot_geom;
      var restriction_height = x || plannerData.restriction_height
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
          // planner.removeAddress(gid, function (success) {
            Parcel.where({'gid': gid}).destroy().then(function() {
              res.status(200).end('success')
            });
          // });
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
