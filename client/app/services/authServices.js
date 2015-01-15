angular.module('dronePass.authServices', [])

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
      dataType: 'json',
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
      dataType: 'json',
      url: '/signup',
      data: user
    })
    .then(function (res) {
      return res.data.token;
    });
  };

  var isAuth = function (authDefer) {
    if (!!$window.localStorage.getItem('com.dronePass')) {
      return $http({
          method: 'GET',
          url: '/checkAuthentication',
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

  var isLoggedIn = function () {
    if (!!$window.localStorage.getItem('com.dronePass')) {
      return $http({
          method: 'GET',
          url: '/checkAuthentication',
        })
        .success(function (data, status, headers, config) {
          return true;
        })
        .error( function (data, status, headers, config) {
          return false;
        });
    } else {
      return false;
    }
  }; 

  
  return {
      signin: signin,
      signup: signup,
      isAuth: isAuth,
      isLoggedIn: isLoggedIn
   };
})