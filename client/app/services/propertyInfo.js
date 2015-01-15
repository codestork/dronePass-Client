angular.module('dronePass.propertyInfo', [])

.factory('PropertyInfo', function ($http) {

  // registering a property
  // use leaflet geocoding to get the coordinates of a property using address entry
  //[v2] use click on map to add address
  var registerAddress = function (coordinates, address) {
    var addressRegistry = {
      coordinates: coordinates,
      address: address,
      restriction_end_time: null,
      restriction_start_time: null
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
  var updatePermission = function (address, restriction_start_time, restriction_end_time) {
    var permissionRegistry = {
      parcel_gid: address.parcel_gid,
      restriction_start_time: restriction_start_time,
      restriction_end_time: restriction_end_time
    };
    return $http({
      method: 'POST',
      url: '/updatePermission',
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
    registerAddress: registerAddress,
    removeAddress: removeAddress,
    updatePermission: updatePermission,
    getRegisteredAddresses: getRegisteredAddresses
  };
});
