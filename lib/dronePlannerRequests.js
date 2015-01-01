var request = require('request');

exports.registerUser = function (newUser) {
  var user_id = newUser.id;
  var login = newUser.username;
  var owner_authority = newUser.owner_authority
  request.post({
    url: //DronePlannerURL,
    form: {user_id: user_id,
          login: login,
          owner_authority: owner_authority}
  }, function(err, httpResponse, body){
    if (err) {
      console.log('err')
    } else {
      console.log('success')
    }
    // expect nothing in response, this is a post to your landOwner database
  });
}

exports.removeUser = function (userID) {

  request.delete({
    url: //DronePlannerURL,
    form: {user_id: userID}
  }, function(err, httpResponse, body){
    if (err) {
      console.log('err')
    } else {
      console.log('success')
    }
    // expect nothing in response, this is a post to delete
  });
}

exports.registerAddress = function(addressRegistry, user_id) {
  var coordinates = addressRegistry.coordinates;
  var restriction_start_time = addressRegistry.restriction_start_time;
  var restriction_end_time = addressRegistry.restriction_end_time;
  request.post({
    url: //DronePlannerURL,
    form: {user_id: user_id,
          coordinates: coordinates,
          restriction_start_time: restriction_start_time // will either be time or null
          restriction_end_time: restriction_end_time // will either be time or null
        }
  }, function(err, httpResponse, body){
    if (err) {
      console.log('err')
    }
    return httpResponse;
      //expecting JSON object with parcel wgs84 info:
       //gid int  NOT NULL,
      //lot_geom geometry(POLYGON)  NOT NULL,
     // parcel_gid int  NOT NULL,
  });
};

exports.removeAddress = function (gid) {
    request.delete({
      url: //DronePlannerURL,
      form: {gid: gid
          }
    }, function(err, httpResponse, body){
      if (err) {
        console.log('err')
      } else {
        console.log('success') // no data needed
      }
    });
  };
}

exports.togglePermissions = function(parcelData, restrictionTimes) {
  var parcel_gid = parcelData.parcel_gid;
  var restriction_start_time = restrictionTimes.restriction_start_time;
  var restriction_end_time = restrictionTimes.restriction_end_time;
  request.post({
    url: //DronePlannerURL,
    form: {parcel_gid: parcel_gid,
          restriction_start_time: restriction_start_time, // will either be time or null
          restriction_end_time: restriction_end_time, // will either be time or null
          } 
  }, function(err, httpResponse, body){
    if (err) {
      console.log('err')
    }
    return httpResponse;
      console.log('success')
      // expecting JSON object with restriction table info:
      // id int  NOT NULL,
      // owned_parcel_gid int  NOT NULL,
      // start_time date  NOT NULL,
      // duration interval  NOT NULL,
  );
  });
};

exports.setException = function (exceptionData) {
  var parcel_gid = exceptionData.parcel_gid
  var exception_start_time = exceptionData.start_time
  var exception_end_time = exceptionData.end_time
  var drone_id = exceptionData.drone_id;
  request.post({
    url: //DronePlannerURL,
    form: {drone_id: drone_id,
           parcel_gid: parcel_gid,
           exception_start_time: exception_start_time,
           exception_end_time: exception_end_time
           }
  }, function(err, httpResponse, body){
    if (err) {
      console.log('err')
    }
    return httpResponse;
      //expecting JSON object with restriction('exception_id')
    });
}

exports.removeException = function (exception_id) {

  request.delete({
    url: //DronePlannerURL,
    form: {exception_id: exception_id}
  }, function(err, httpResponse, body){
    if (err) {
      console.log('err')
    } else {
      console.log('success')
      //only requires confirmation
    }
    });
}