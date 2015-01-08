angular.module('dronePass.auth', [])

.controller('AuthController', function ($scope, $rootScope, $window, $state, PropertyInfo, Auth) {
  $scope.user = {};
  $rootScope.landing = true;

  $scope.signin = function () {
    // sign in function
    Auth.signin($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.dronePass', token);
        $state.transitionTo('homePortal');
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
        $state.transitionTo('homePortal');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

});