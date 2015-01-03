var request = require('request');
var request2 = require('request-json');
var client = request2.newClient('http://10.6.23.224:3000/');

exports.registerUser = function (newUser) {
  var user_id = newUser.attributes.id;
  var login = newUser.attributes.username;
  var owner_authority = newUser.attributes.owner_authority;
  // console.log({user_id: user_id,
  //         login: login,
  //         owner_authority: owner_authority})
  client.post('/registerUser', {user_id: user_id,
          login: login,
          owner_authority: owner_authority
  }, function(err, response, body){
    if (err) {
      console.log('err');
    } else {
      console.log(body);
    }
    // expect nothing in response, this is a post to your landOwner database
  });
}

exports.removeUser = function (userID) {

  request.delete({
    url: 'http://10.7.25.218:3000/removeUser',
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
    url: 'http://10.7.25.218:3000/registerAddress',
    form: {user_id: user_id,
          coordinates: coordinates,
          restriction_start_time: restriction_start_time, // will either be time or null
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
      url: 'http://10.7.25.218:3000/removeAddress',
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


exports.togglePermissions = function(parcelData, restrictionTimes) {
  var parcel_gid = parcelData.parcel_gid;
  var restriction_start_time = restrictionTimes.restriction_start_time;
  var restriction_end_time = restrictionTimes.restriction_end_time;
  request.post({
    url: 'http://10.7.25.218:3000/togglePermissions',
    form: {parcel_gid: parcel_gid,
          restriction_start_time: restriction_start_time, // will either be time or null
          restriction_end_time: restriction_end_time, // will either be time or null
          } 
  }, function(err, httpResponse, body){
    if (err) {
      return err;
    }
    return httpResponse;
      // expecting JSON object with restriction table info:
      // id int  NOT NULL,
      // owned_parcel_gid int  NOT NULL,
      // start_time date  NOT NULL,
      // duration interval  NOT NULL,
    })
};

exports.setException = function (exceptionData) {
  var parcel_gid = exceptionData.parcel_gid
  var exception_start_time = exceptionData.start_time
  var exception_end_time = exceptionData.end_time
  var drone_id = exceptionData.drone_id;
  
  request.post({
    url: 'http://10.7.25.218:3000/setException',
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
    url: 'http://10.7.25.218:3000/removeException',
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