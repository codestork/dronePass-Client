/*******************************************
*  Setup for app main and ui-router routes *
*******************************************/
var dronePass = angular.module('dronePass', [
  'dronePass.authServices',
  'dronePass.droneSimulator',
  'dronePass.propertyInfo',
  'dronePass.homePortal',
  'dronePass.auth',
  'ngFx',
  'ui.router',
  'leaflet-directive',
  'btford.socket-io',
])

.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
  
  $urlRouterProvider.otherwise('/landingPage');
  $stateProvider
    .state('landingPage', {
      templateUrl: '/app/landingPage/landingPage.html',
      url: '/landingPage',
      authenticate: false,
      resolve: { 
        navbar: ['$rootScope', function ($rootScope) {
          return $rootScope.landing = false;
        }]
      },
      animation: {
        enter: 'grow-in',
        leave: 'shrink-out',
        ease: 'back',
        speed: 400
      }
    })
    .state('signin', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController',
      url: '/signin',
      authenticate: false,
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
      authenticate: false,
      animation: {
        enter: 'shrink-in',
        leave: 'grow-out',
        ease: 'back',
        speed: 400
      }
    })
    .state('homePortal', {
      url: '/homePortal',
      resolve: { 
        auth: ['Auth', '$q', function (Auth, $q) {
          var authDefer = $q.defer();
          Auth.isAuth(authDefer)
          return authDefer.promise;
        }]
      },
      animation: {
        enter: 'shrink-in',
        leave: 'grow-out',
        ease: 'back',
        speed: 400
      },
     views: {
         '': {
           templateUrl: 'app/homePortal/homePortal.html',
           controller: 'HomePortalController'
         },
         'states@HomePortal': {
           templateUrl: 'app/homePortal/states.html'
         }
    }
  });

    $httpProvider.interceptors.push('AttachTokens');
})
.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.dronePass');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.controller ('signout', function ($window, $scope, $http, $state, Auth) {
  $scope.signout = function () {
  $window.localStorage.removeItem('com.dronePass');
    return $http({
      method: 'POST',
      url: '/signout',
      data: {}
    })
    .then(function (res) {
      $state.transitionTo('landingPage');
    });  
  };
})
.run(function ($rootScope, $state, Auth) {
  // here inside the run phase of angular, our services and controllers
  // have just been registered and our app is ready
  // however, we want to make sure the user is authorized
  // we listen for when angular is trying to change routes
  // when it does change routes, we then look for the token in localstorage
  // and send that token to the server to see if it is a real user or hasn't expired
  // if it's not valid, we then redirect back to signin/signup

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    $state.transitionTo('signin');
  });

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    $rootScope.isLoggedIn = Auth.isLoggedIn()
  })
  
});


