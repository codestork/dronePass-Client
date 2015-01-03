angular.module('dronePass.propertyInfo', [])

.factory('PropertyInfo', function ($http) {
  /*storage of all addresses for a specific user.
  When a user logs in, this will be populated with the home addresses specific to this user */
  /*add address to homes format:
    addresses{
      string address: coordinates of point[#, #],
      etc,
      etc
  }; */

  var addresses = {
    centerZip : null
  };

  // registering a property
  // use mapbox geocoding to get the coordinates of a property using address entry
  //[v2] use click on map to add address
  var registerAddress = function (coordinates, address) {
    var addressRegistry = {
      coordinates: coordinates,
      address: address,
    };
    return $http({
      method: 'POST',
      url: '/registerAddress',
      data: addressRegistry
    })
    .then(function (res) {
      return res.data;
    });


  };
  // removes an address from a user's list of homes
  var removeAddress = function (gid) {
    
    return $http({
      method: 'DELETE',
      url: '/removeAddress/' + gid,
    })
    .then(function (res) {
      return res.data;
    });
  };

  // toggles flight path permissions for drones above a specific address
  var togglePermissions = function (address, restriction_start_time, restriction_end_time) {
    var permissionRegistry = {
      parcel_gid: address.parcel_gid,
      restriction_start_time: restriction_start_time,
      restriction_end_time: restriction_end_time
    };
    return $http({
      method: 'POST',
      url: '/togglePermissions',
      data: permissionRegistry
    })
    .then(function (res) {
      console.log(res.data);
      return res.data;
    });
  };
  // displays all homes for a user and the permissions set on each
  var getRegisteredAddresses = function () {

    return $http({
      method: 'GET',
      url: '/getRegisteredAddresses',
    })
    .then(function (res) {
      return res.data;
    });
    // start time
  };
  return {
    addresses: addresses,
    registerAddress: registerAddress,
    removeAddress: removeAddress,
    togglePermissions: togglePermissions,
    getRegisteredAddresses: getRegisteredAddresses
  };
});
