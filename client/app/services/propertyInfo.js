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
      addres: address,
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
  var removeAddress = function (address) {
    var addressDeletion= {
      address: address,
      userToken: userToken
    };
    return $http({
      method: 'DELETE',
      url: '/deleteAddress',
      data: addressDeletion
    })
    .then(function (res) {
      return res.data;
    });
  };

  // toggles flight path permissions for drones above a specific address
  var togglePermissions = function (address, permission) {
    var permissionRegistry = {
      address: address,
      userToken: userToken,
      permission: permission
    };
    return $http({
      method: 'POST',
      url: '/togglePermission',
      data: permissionRegistry
    })
    .then(function (res) {
      return res.data;
    });
  };
  // displays all homes for a user and the permissions set on each
  var getProperties = function () {
    var user = {
      userToken: userToken
    };
    return $http({
      method: 'GET',
      url: '/getProperties',
      data: user
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
    getProperties: getProperties,
  };
});
