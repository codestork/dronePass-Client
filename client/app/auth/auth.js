angular.module('dronePass.auth', [])

.controller('AuthController', function ($scope, $window, $location, Auth, PropertyInfo) {
  $scope.user = {};


  $scope.signin = function () {
    // sign in function
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
    PropertyInfo.addresses.centerZip = $scope.zipCode;
    Auth.signup($scope.user).then(function (token) {
        $window.localStorage.setItem('com.dronePass', token);
        $location.path('/homePortal');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

});