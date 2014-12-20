angular.module('dronePass.services', [])

.factory('PropertyInfo', function () {
  /*storage of all addresses for a specific user.
  When a user logs in, this will be populated with the home addresses specific to this user */
  var addresses = {};
  /*add address to homes format:
    addresses{
      string address: coordinates of point[#, #],
      etc,
      etc
  }; */
  var addAddress = function (address) {

    return;
  };
  // removes an address from a user's list of homes
  var removeAddress = function (address) {
    return;
  };

  // toggles flight path permissions for drones above a specific address
  var togglePermissions = function (address) {
    return;
  };
  // displays all homes for a user and the permissions set on each
  var showMyPermissions = function (homes) {
    return;
  };
  return {
    addresses: addresses,
    addAddress: addAddress,
    removeAddress: removeAddress,
    togglePermissions: togglePermissions
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
    // return $http({
    //   method: 'POST',
    //   url: '/api/users/signin',
    //   data: user
    // })
    // .then(function (resp) {
    //   return resp.data.token;
    // });
  };

  var signup = function (user) {
    // return $http({
    //   method: 'POST',
    //   url: '/api/users/signup',
    //   data: user
    // })
    // .then(function (resp) {
    //   return resp.data.token;
    // });
  };

  var isAuth = function () {
    // return !!$window.localStorage.getItem('com.dronePass');
  };

  var signout = function () {
    // $window.localStorage.removeItem('com.dronePass');
    // $location.path('/signin');
  };


  return {
    signin: signin,
    signup: signup,
    isAuth: isAuth,
    signout: signout
  };
});
