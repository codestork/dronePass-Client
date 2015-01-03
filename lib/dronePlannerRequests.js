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
  var data = {user_id: userID}
  client.delete('/removeUser', data , function(err, res, body){
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
  client.post('/registerAddress', data, function(err, res, body){
    if (err) {
      response(err)
    } else {
      response(body);  
    }
  });
};

exports.removeAddress = function (gid, callback) {
  var data = {gid: gid};
    client.delete('/removeAddress',data, function(err, res, body){
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
  var data = {exception_id: exception_id};
  client.delete('/removeException', function(err, res, body){
    if (err) {
      callback(err)
    } else {
      callback(body);
      //only requires confirmation
    }
    });
}