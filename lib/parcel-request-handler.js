var bcrypt = require('bcrypt');
var path = require('path');
var util = require('../lib/utility');
var User = require('../db/models/user');
var Parcel = require('../db/models/parcelData');
var ParcelCollection = require('../db/collections/parcelDataCollection');
var admin = require('../lib/droneAdminRequests');
var Exemption = require('../db/models/restrictionExemption');
var ExemptionCollection = require('../db/collections/restrictionExemptions');

exports.registerAddress = function (req, res){
  
  util.getUserFromToken(req, function (authUser) {
    if (!authUser) {
      return res.status(404).end('User is not authorized to perform this operation');
    }
    var user_id = authUser.attributes.id;
    
    admin.registerAddress(req.body, user_id, function (err, status, adminData) {
      console.log(adminData)
      if (err || adminData.name ==='error' || !adminData[0]) {
        return res.status(404).end('Invalid address or already registered. Please enter a valid address');
      } 
      adminData = adminData[0];
      console.log(adminData)
      var parcel_gid = adminData.parcel_gid;
      var gid = adminData.gid;
      var lot_geom = JSON.stringify(adminData.lot_geom);
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
            res.status(404).end('This address has already been registered. Please enter a different address');
          }
        });
    });
  });
};

exports.removeAddress = function (req, res) {
  util.getUserFromToken(req, function (authUser) {
    if (!authUser) {
      return res.status(404).end('User is not authorized to perform this operation');
    }
    var gid = req.url.split('/')[2];
    new Parcel({'gid': gid, user_id: authUser.id}).fetch().then(function(parcel){
        if (!parcel) {
          res.status(404).end('This address has not been registered');
        } else {
            admin.removeAddress(gid, function (err, status, adminResponse) {
              if (adminResponse.name ==='error') {
                return res.status(404).end('Unable to remove address. Please contact our technical team');
              } 
              Parcel.where({'gid': gid}).destroy().then(function() {
                res.status(200).end('success')
              });
            });
        }
    });
  });
};

exports.getRegisteredAddresses = function (req, res){

  util.getUserFromToken(req, function (authUser) {
    if (authUser) {
      var user_id = authUser.id;
      Parcel.where({'user_id': user_id}).fetchAll()
        .then(function(parcels) {
          console.log(parcels.models);
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
  })
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
