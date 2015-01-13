var request = require('request-json');
// testing
// var client = request.newClient('http://10.6.23.224:3000/');
var client = request.newClient('http://admin.dronepass.org:3000');

exports.registerUser = function (newUser, callback) {
  var data = {
    user_id : newUser.attributes.id,
    login : newUser.attributes.username,
    owner_authority : newUser.attributes.owner_authority
  }
  
  client.post('/registerUser', data , function(err, res, body){
    callback(err, res, body);
  });
};

exports.removeUser = function (userID, callback) {
  client.del('/removeUser/' + userID, function(err, res, body){
    callback(err, res, body);
  });
};


exports.registerAddress = function(addressRegistry, user_id, callback) {
  var data = {
    user_id: user_id,
    coordinates : addressRegistry.coordinates,
    restriction_start_time : addressRegistry.restriction_start_time,
    restriction_end_time : addressRegistry.restriction_end_time
  }

  client.post('/registerAddress', data, function(err, res, body){
    callback(err, res, body);
  });
};

exports.removeAddress = function (gid, callback) {
  client.del('/removeAddress/' + gid, function(err, res, body){
    callback(err, res, body);
  });
};


exports.updatePermission = function(parcel_gid, restriction_start_time, restriction_end_time, callback) {
  var data = {
    parcel_gid : parcel_gid,
    restriction_start_time : restriction_start_time,
    restriction_end_time : restriction_end_time
  }
  console.log(data);
  client.post('/updatePermission', data , function(err, res, body){
    callback(err, res, body);
  });
};

exports.setExemption = function (exemptionData, callback) {
  var data = {
    parcel_gid : exemptionData.parcel_gid,
    exemption_start_time : exemptionData.start_time,
    exemption_end_time : exemptionData.end_time,
    drone_id : exemptionData.drone_id
  }
  
  client.post('/setExemption',data, function(err, res, body){
    callback(err, res, body);
  });
};

exports.removeExemption = function (exemption_id, callback) {
  client.del('/removeExemption/' + exemption_id , function(err, res, body){
    callback(err, res, body);
  });
}