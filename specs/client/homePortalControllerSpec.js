describe('HomePortalController', function () {
  var $scope, $rootScope, $location, leafletData, PropertyInfo, createController;

  // using angular mocks, we can inject the injector
  // to retrieve our dependencies
  beforeEach(module('dronePass'));
  beforeEach(inject(function ($injector) {

    // mock out our dependencies
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    PropertyInfo = $injector.get('PropertyInfo');
    $location = $injector.get('$location');

    $scope = $rootScope.$new();

    var $controller = $injector.get('$controller');

    createController = function () {
      return $controller('HomePortalController', {
        $scope: $scope,
        PropertyInfo: PropertyInfo,
        leafletData: leafletData
      });
    };

    createController();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have a map property on the $scope', function () {
    expect($scope.map).to.be.an('object');
  });

  // it('should have a addLink method on the $scope', function () {
  //   expect($scope.addLink).to.be.a('function');
  // });

  // it('should be able to create new links with addLink()', function () {
  //   $httpBackend.expectPOST("/api/links").respond(201, '');
  //   $scope.addLink();
  //   $httpBackend.flush();
  // });
});
