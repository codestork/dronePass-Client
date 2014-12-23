/*******************************************
*  Setup for app main and ui-router routes *
*******************************************/
var dronePass = angular.module('dronePass', [
  'dronePass.services',
  'dronePass.homePortal',
  'dronePass.auth',
  'ngFx',
  'ui.router',
  'leaflet-directive'
])

.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/landingPage');

  $stateProvider
    .state('landingPage', {
      templateUrl: '/app/landingPage/landingPage.html',
      url: '/landingPage',
      animation: {
        enter: 'grow-in',
        leave: 'shrink-out',
        ease: 'back',
        speed: 400
      }
    })
    .state('homePortal', {
      templateUrl: 'app/homePortal/homePortal.html',
      controller: 'HomePortalController',
      url: '/homePortal',
      animation: {
        enter: 'shrink-in',
        leave: 'grow-out',
        ease: 'back',
        speed: 400
      }
    })
    .state('signin', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController',
      url: '/signin',
      animation: {
        enter: 'grow-in',
        leave: 'shrink-out',
        ease: 'back',
        speed: 400
      }
    })
    .state('signup', {
      templateUrl: 'app/auth/signup.html',
      controller: 'AuthController',
      url: '/signup',
      animation: {
        enter: 'shrink-in',
        leave: 'grow-out',
        ease: 'back',
        speed: 400
      }
    });
});
