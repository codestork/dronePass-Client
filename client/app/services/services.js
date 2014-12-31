angular.module('dronePass.services', [])

.factory('PropertyInfo', function ($http, AttachTokens) {
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
  var registerAddress = function (address) {
    var addressRegistry = {
      address: address,
      userToken: userToken
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
})
.factory('Auth', function ($http, $location, $window) {
  // Don't touch this Auth service!!!
  // it is responsible for authenticating our user
  // by exchanging the user's username and password
  // for a JWT from the server
  // that JWT is then stored in localStorage as 'com.dronePass'
  // after you signin/signup open devtools, click resources,
  // then localStorage and you'll see your token from the server
  var signin = function (user) {
    return $http({
      method: 'POST',
      url: '/signin',
      data: user
    })
    .then(function (res) {
      return res.data.token;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/signup',
      data: user
    })
    .then(function (res) {
      console.log(res)
      return res.data.token;
      });
  };

  var isAuth = function (authDefer) {
    if (!!$window.localStorage.getItem('com.dronePass')) {
      return $http({
          method: 'GET',
          url: '/checkAuth',
        })
        .success(function (data, status, headers, config) {
          authDefer.resolve();
        })
        .error( function (data, status, headers, config) {
          authDefer.reject()
        });
    } else {
      authDefer.reject();
    }

  }; 
  
  return {
      signin: signin,
      signup: signup,
      isAuth: isAuth
   };
  })
  .factory('DroneCommunication', function () {
    var getDroneCoordinates = function () {
      // enter receival of drone coordinates
      return;
    }

    return {
      getDroneCoordinates: getDroneCoordindates
    }
  })


