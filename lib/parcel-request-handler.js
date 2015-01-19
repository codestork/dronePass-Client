var bcrypt = require('bcrypt');
var path = require('path');
var util = require('../lib/utility');
var User = require('../db/models/user');
var Parcel = require('../db/models/parcelData');
var ParcelCollection = require('../db/collections/parcelDataCollection');
var admin = require('../lib/droneAdminRequests');
var Exemption = require('../db/models/restrictionExemption');
var ExemptionCollection = require('../db/collections/restrictionExemptions');

// this function registers the address in the Drone Admin Server,
// which looks up the coordinates given in the request to locate the parcel in which
// the coordinates are located, and sends back a GeoJSON polygon and Parcel ID details
// to this Homeowner API server
exports.registerAddress = function (req, res){
  
  util.getUserFromToken(req, function (authorizedUser) {
    if (!authorizedUser) {
      return res.status(404).end('User is not authorized to perform this operation');
    }
    var user_id = authorizedUser.attributes.id;
    
    // lookup in admin server. Address Coordinates are included in req.body
    admin.registerAddress(req.body, user_id, function (err, status, adminData) {
      if (err || adminData.name ==='error' || !adminData[0]) {
        return res.status(404).end('Invalid address or already registered. Please enter a valid address');
      } 
      
      adminData = adminData[0];
      var parcel_gid = adminData.parcel_gid;
      // data to be entered in table
      var parcelInformation = {
        gid: adminData.gid,
        user_id: user_id,
        lot_geom: JSON.stringify(adminData.lot_geom),
        parcel_gid: parcel_gid,
        restriction_height: 0, // [ToDo: allow for restriction heights]
        address: req.body.address,
        restriction_start_time: req.body.restriction_start_time,
        restriction_end_time: req.body.restriction_end_time
      };
      new Parcel({'parcel_gid': parcel_gid})
        .fetch()
        .then(function(parcel) {
          if (!parcel) {
            var newParcel = new Parcel(parcelInformation);
            newParcel.save().then(function(newParcel) {
                ParcelCollection.add(newParcel);
                res.json(newParcel); // returns new parcel data to client to render in GeoJSON
            });
          } else {
            res.status(404).end('This address has already been registered. Please enter a different address');
          }
        });
    });
  });
};

exports.removeAddress = function (req, res) {
  util.getUserFromToken(req, function (authorizedUser) {
    if (!authorizedUser) {
      return res.status(404).end('User is not authorized to perform this operation');
    }
    var gid = req.url.split('/')[2];
    new Parcel({'gid': gid, user_id: authorizedUser.id}).fetch().then(function(parcel){
        if (!parcel) {
          res.status(404).end('This address has not been registered');
        } else {
            admin.removeAddress(gid, function (err, status, adminResponse) {
              if (adminResponse.name ==='error') {
                return res.status(404).end('Unable to remove address. Please contact our technical team');
              } 
              Parcel.where({'gid': gid}).destroy().then(function() {
                res.status(200).end('success');
              });
            });
        }
    });
  });
};

exports.getRegisteredAddresses = function (req, res){

  util.getUserFromToken(req, function (authorizedUser) {
    if (authorizedUser) {
      var user_id = authorizedUser.id;
      Parcel.where({'user_id': user_id}).fetchAll()
        .then(function(parcels) {
          if (!parcels) {
            res.status(200).end('User has no registered addresses');
          } else {
            res.json(parcels);
          }
        });
    } else {
      return res.status(404).end('Unauthorized user');
    }
  });
};

exports.updatePermission = function (req, res) {
  var parcel_gid = req.body.parcel_gid;
  var restriction_start_time = req.body.restriction_start_time;
  var restriction_end_time = req.body.restriction_end_time;
  new Parcel({'parcel_gid': parcel_gid}).fetch().then(function(parcel){
      if (!parcel) {
        return res.status(404).end('Invalid address');
      } else {
          admin.updatePermission(parcel_gid, restriction_start_time, restriction_end_time,
          function (err, status, adminResponse) {
            if (err || adminResponse.name ==='error') {
              return res.status(404).end('Times entered were invalid. Please enter a valid start and end time');
            } 
              parcel.save({restriction_start_time: restriction_start_time,
                restriction_end_time: restriction_end_time}, {patch: true})
                .then(function(updatedParcel) {
                  res.json(updatedParcel);
              });
          });       
        }
  });
};

//[ToDo: V2 - flight exemptions for dronePath]
exports.setExemption = function (req, res) {
  var parcel_gid = req.body.parcel_gid;
  var exemption_start_time = req.body.exemption_start_time;
  var exemption_end_time = req.body.exemption_end_time;
  var drone_id = req.body.drone_id;


 admin.setExemption(req.body, function (err, status, adminResponse) {
    if (err || adminResponse.name ==='error' || !adminResponse.exemption_id) {
      return res.status(404).end('invalid exemption request');
    } 
    new Exemption({'exemption_id': adminResponse.exemption_id})
      .fetch()
      .then(function(exemption) {
        if (!exemption) {
          var newExemption = new Parcel({
            exemption_id: adminResponse.exemption_id,
            drone_id: drone_id,
            parcel_gid: parcel_gid,
            exemption_start_time: exemption_start_time,
            exemption_end_time: exemption_end_time
          })
          newExemption.save().then(function(newExemption) {
              res.json(newExemption);
              ExemptionCollection.add(newExemption);
          });
        } else {
          res.status(404).end('invalid exemption request');
        }
      });
  });
};

exports.removeExemption = function (req, res) {
  var exemption_id = req.body.exemption_id;
  new Exemption({'exemption_id': exemption_id}).fetch().then(function(exemption){
      if (!exemption) {
        res.status(404).end('Failure to find exemption');
      } else {
          admin.removeExemption(exemption_id, function (err, status, adminResponse) {
            if (err || adminResponse.name ==='error') {
              return res.status(404).end('invalid exemption request');
            } 
            exemption.destroy().then(function() {
              res.status(200).end('success')
            });
          });
        }
  });
};

exports.getExemptions = function (req, res){
  var parcel_id = req.body.parcel_id;
  new Exemption({'parcel_id': parcel_id})
    .fetchAll()
    .then(function(exemptions) {
      if (!exemptions) {
        res.status(200).end('No exemptions attached to this user');
      } else {
        res.json(exemptions);
      }
    });
};
