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
  'ui.bootstrap'
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
          $rootScope.landing = false;
        }]
      }
    })
    .state('signin', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController',
      url: '/signin',
      authenticate: false
    })
    .state('signup', {
      templateUrl: 'app/auth/signup.html',
      controller: 'AuthController',
      url: '/signup',
      authenticate: false
    })
    .state('homePortal', {
      url: '/homePortal',
      resolve: { 
        auth: ['Auth', '$q', function (Auth, $q) {
          var authDefer = $q.defer();
          Auth.isAuth(authDefer);
          return authDefer.promise;
        }]
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
    })
    .state('about', {
      templateUrl: 'app/about/about.html',
      url: '/about',
      authenticate: false,
      resolve: {auth: function ($rootScope) {
        $rootScope.landing = true;
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
  // here is where we look for state changes.
  //If a user tries to enter the Home Portal without being signed in, they will be
  // redirected to the sign in page
  // Log in / Log out buttons are likewise displayed based on authentication status

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    $rootScope.redirectedFromHomePortal = true;
    $state.transitionTo('signin');
  });

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    $rootScope.isLoggedIn = Auth.isLoggedIn();
  });
  
});

