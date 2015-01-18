angular.module('dronePass.auth', [])

.controller('AuthController', function ($scope, $rootScope, $window, $state, $timeout, Auth) {
  $scope.user = {};
  $rootScope.landing = true;

  $scope.clearFieldsOnError = function (errorMessage) {
    $scope.newError = true;
    $scope.errorMessage = errorMessage
    $scope.user.username = "";
    $scope.user.password = "";
    $scope.user.name = "";
    if ($scope.newError = true) {
      $timeout(function () {
        $scope.newError = false;  
      }, 2500)
    }
  }

  $scope.signin = function () {
    $scope.newError = false;
    Auth.signin($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.dronePass', token);
        $state.transitionTo('homePortal');
      })
      .catch(function (error) {
        $scope.clearFieldsOnError(error.data);
      });
  };

  $scope.signup = function () {
    $scope.newError = false;
    Auth.signup($scope.user).then(function (token) {
        $window.localStorage.setItem('com.dronePass', token);
        $state.transitionTo('homePortal');
      })
      .catch(function (error) {
        $scope.clearFieldsOnError(error.data);
      });
  };

  $scope.redirectMessage = 'You must be logged in to visit the Homeowner Portal'

  if ($rootScope.redirectedFromHomePortal) {
    $scope.clearFieldsOnError($scope.redirectMessage);
    $rootScope.redirectedFromHomePortal = false;
  };

});