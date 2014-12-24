angular.module('dronePass.auth', [])

.controller('AuthController', function ($scope, $window, $location, Auth) {
  $scope.user = {};


  $scope.signin = function () {
    // sign in function
    console.log($scope.user)
    Auth.signin($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.dronePass', token);
        $location.path('/homePortal');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    // sign up function
    Auth.signup($scope.user).then(function (token) {
        $window.localStorage.setItem('com.dronePass', token);
        $location.path('/homePortal');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

});