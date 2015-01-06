var request = require('request-json');
var client = request.newClient('http://10.6.23.224:3000/');

exports.registerUser = function (newUser, callback) {
  var data = {
    user_id : newUser.attributes.id,
    login : newUser.attributes.username,
    owner_authority : newUser.attributes.owner_authority
  }
  
  client.post('/registerUser', data , function(err, res, body){
    if (err) {
      callback(err)
    } else {
      callback(body);
    }
  });
};

exports.removeUser = function (userID, callback) {
  client.del('/removeUser/' + userID, function(err, res, body){
    if (err) {
      callback(err);
    } else {
      callback(body);
    }
  });
};


exports.registerAddress = function(addressRegistry, user_id, callback) {
  var data = {
    user_id: user_id,
    coordinates : addressRegistry.coordinates,
    restriction_start_time : addressRegistry.restriction_start_time,
    restriction_end_time : addressRegistry.restriction_end_time
  }
  console.log(data);
  
  client.post('/registerAddress', data, function(err, res, body){
    if (err) {
      callback(err)
    } else {
      callback(body);  
    }
  });
};

exports.removeAddress = function (gid, callback) {
  client.del('/removeAddress/' + gid, function(err, res, body){
      if (err) {
        callback(err);
      } else {
        callback(body); // no data needed
      }
    });
};


exports.togglePermissions = function(parcelData, restrictionTimes, callback) {
  var data = {
    parcel_gid : parcelData.parcel_gid,
    restriction_start_time : restrictionTimes.restriction_start_time,
    restriction_end_time : restrictionTimes.restriction_end_time
  }
  client.post('/togglePermissions',data , function(err, res, body){
    if (err) {
      callback(err);
    } else {
      callback(body);
    }
  });
};

exports.setException = function (exceptionData, callback) {
  var data = {
    parcel_gid : exceptionData.parcel_gid,
    exception_start_time : exceptionData.start_time,
    exception_end_time : exceptionData.end_time,
    drone_id : exceptionData.drone_id
  }
  
  client.post('/setException',data, function(err, res, body){
    if (err) {
      callback(err);
    }
      callback(body)
    });
};

exports.removeException = function (exception_id, callback) {
  client.del('/removeException/' + exception_id , function(err, res, body){
    if (err) {
      callback(err)
    } else {
      callback(body);
      //only requires confirmation
    }
    });
}