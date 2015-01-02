angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $http, leafletData, PropertyInfo, DroneSimulator, $q) { 
  $scope.addresses = PropertyInfo.addresses;

  angular.extend($scope, {
    center: {
        lat:  37.65,
        lng: -121.91,
        zoom: 12,
    },
    controls: {
      draw: {}
    },
    layers: {
      baselayers: {
        basemap: {
          name: 'Mapbox map',
          type: 'xyz',
          url: 'http://api.tiles.mapbox.com/v4/lizport10.kiapnjfg/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
          layerOptions: {
            apikey: 'pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
              mapid: 'lizport10.kiapnjfg'
          }
        }
      }
    },
    geojson : {
      data: {
        "type": "FeatureCollection",
        "features": []
        // {
        //   "type": "Feature",
        //   "properties": {id: 1, user: 'liz', permission: 0},
        //   "geometry": {
        //     "type":"MultiPolygon",
        //     "coordinates":[[
        //       [[ -121.07539899754, 37.6653423600288],
        //       [-122.075814597179, 38.665224522955],
        //       [-122.075508328885, 37.6654469910699],
        //       [ -121.07539899754, 37.6653423600288]]
        //       ]]
        //     }
        //   },
        //   {
        //     "type": "Feature",
        //     "properties": {id: 2, user: 'liz', permission: 0},
        //     "geometry": {
        //       "type":"MultiPolygon",
        //       "coordinates":[[
        //         [[ -123.07539899754, 37.662423600288],
        //         [-126.075814597179, 38.675224522955],
        //         [-122.075508928885, 37.6654469910699],
        //         [ -123.07839899754, 37.6653423600288]]
        //         ]]
        //       }
      },
      style: {
        fillColor: "yellow",
        weight: 4,
        opacity: 1,
        color: 'blue',
        dashArray: '3',
        fillOpacity: 0.7
      }
    },
    events: {
       map: {
          enable: ['zoomstart', 'drag', 'mousemove'],
          logic: 'emit'
      }
    }
  });

  $scope.featureCollection = $scope.geojson.data.features;

  $scope.addFeature = function (newFeature) {
    $scope.featureCollection.push(newFeature);
  }
  /***************** Drone Simulator ***********************/

  $scope.drones = {}
  $scope.droneSimData = null;
  
  socket.on('ReceiveCoordinatesEvent', function (ev, data) {
    //format information received from denny
    $scope.droneSimData = formattedCoordinates
  }

  $scope.beginDroneFlight = function (droneID, droneData) {
    var newDrone = {
      "type": "Feature",
      "properties": {droneID: droneID, figure: 'drone'},
      "geometry": droneData,
    }
    $scope.drones[droneID] = newDrone;
    $scope.addFeature(newDrone);
  }

  $scope.endDroneFlight = function (droneID) {
    delete $scope.drones[droneID];
    for (var i = 0; i < $scope.geojson.data.features; i++){
      if ($scope.featureCollection[i].properties.droneID = droneID) {
        $scope.featureCollection.splice(i, 1);
      }
    }
  }

  $scope.getDroneCoordinates = function () {

    var deferred = $q.defer()

    deferred.promise.then(function(){
      for (var droneSimID in $scope.droneSimData) {
          if ($scope.drones[droneSimID]) {
              $scope.drones[droneSimID] = $scope.droneSimData[droneSimID];
        } else {
          $scope.beginDroneFlight(droneSimID, $scope.droneSimData[droneSimID])
          }
      }

      for (var drone in $scope.drones) {
        if (!$scope.droneSimData[drone]) {
          $scope.endDroneFlight(drone);
        }
      }
    }).then(function(){
      $scope.renderDronePositions()
    })

    deferred.resolve();
  };
  
  $scope.renderDronePositions = function () {
    for (var i = 0; i < $scope.featureCollection.length; i++) {
      if ($scope.featureCollection[i].properties.figure === 'drone') {
        var id = $scope.featureCollection[i].properties.droneID;
        $scope.featureCollection[i].geometry = $scope.drones[id];
        console.log($scope.drones[id]);
      }
    }
  }

  setInterval($scope.getDroneCoordinates, 2000);

  /************** Address Selection ***************************/
  // Allows user to select address based on search, form entry, or click 
  $scope.selectedCoordinates =[];
  // enables address search
  leafletData.getMap('map').then(function(map) {
    new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.OpenStreetMap()
    }).addTo(map)
    //.geosearch(PropertyInfo.addresses.centerZip);
  });

  // adds searched Coordinates to selected for DB query
  leafletData.getMap('map').then(function(map) {
    map.on('geosearch_showlocation', function (result) {
      $scope.selectedCoordinates = [result.Location.X, result.Location.Y]
      console.log($scope.selectedCoordinates)
    });
  });


  // lets user draw polygons on map
  leafletData.getMap('map').then(function(map) {
      var drawnItems = $scope.controls.edit.featureGroup;
      map.on('draw:created', function (e) {
      var layer = e.layer;
      drawnItems.addLayer(layer);
      console.log(JSON.stringify(layer.toGeoJSON()));
    });
  });

  //[ToDo]: Implement form entry option, and write database queries to account for all methods of entry

  /***************** Database Queries ***********************/

  // Registers an address
  $scope.registerAddress = function () {
    PropertyInfo.registerAddress($scope.selectedCoordinates)
      .then(function(newAddressPolygon) {
        $scope.geojson.data.features.push(newAddressPolygon);
      })
  };

  // deletes selectedAddress
  $scope.deleteAddress = function () {
    PropertyInfo.deleteAddress($scope.selectedCoordinates)
      .then(function(response) {
        for(var i = 0; i < $scope.geojson.data.features.length; i++) {
          if (response.properties.id === $scope.geojson.data.features[i].properties.id){
            $scope.geojson.data.features.splice(i, 1);
          } 
        }
      })
  }

  $scope.permission = 0;
  $scope.togglePermissions = function () {
    PropertyInfo.togglePermissions($scope.selectedCoordinates, $scope.permission)
      .then(function(response) {
        // change style of display
      })
  }

  // returns all address Polygons for a given user
  $scope.getAddresses = function () {
    PropertyInfo.getAddresses().then(function (newAddressePolygons) {
      for (var j = 0; j < newAddressesPolygons.addressArray; j++) {
       $scope.geojson.data.features.push(newAddressPolygons[a]);
      }
    });
  }

});
