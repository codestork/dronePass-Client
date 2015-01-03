angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $http, leafletData, PropertyInfo, DroneSimulator, $q) { 

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
          zIndex: -20,
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
    // Test
    //var droneSims = DroneSimulator.getDroneCoordinates($scope.xxx, $scope.yyy);
    // $scope.xxx = -121.91;
    // $scope.yyy = 37.65;
    //   setInterval(function (){
    //   $scope.xxx += .001;
    //   $scope.yyy += .001;
    // },2000 )

    var deferred = $q.defer()

    deferred.promise.then(function () {
      return DroneSimulator.getDroneCoordinates();
    }).then(function(droneSims){
      console.log(droneSims)
      for (var droneSimID in droneSims) {
          if ($scope.drones[droneSimID]) {
              $scope.drones[droneSimID] = droneSims[droneSimID];
        } else {
          $scope.beginDroneFlight(droneSimID, droneSims[droneSimID])
          }
      }

      for (var drone in $scope.drones) {
        if (!droneSims[drone]) {
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

  // setInterval($scope.getDroneCoordinates, 2000);

  /************** Address Selection ***************************/
  // Allows user to select address based on search, form entry, or click 
  $scope.selectedCoordinates =[];
  // enables address search
  leafletData.getMap('map').then(function(map) {
   $scope.geoSearch = new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.Google()
    });
   $scope.geoSearch.addTo(map);
  });



  // adds searched Coordinates to selected for DB query
  leafletData.getMap('map').then(function(map) {
    map.on('geosearch_showlocation', function (result) {
      $scope.selectedCoordinates = [result.Location.X, result.Location.Y]
    });
  });

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
  $scope.addresses = {};

  $scope.newAddress = {};

  var formatAddress = function (addressObj) {
    var addressString= "";
    for (var addressInput in addressObj) {
      addressString = addressString + addressObj[addressInput] + ", ";
    }
    return addressString.substring(0, addressString.length -2)
  }

  var createAddressFeature = function (registeredAddress) {

    var newAddressPolygon = {
      "type": "Feature",
      "properties": {gid: registeredAddress.gid,
                     parcel_gid: registeredAddress.parcel_gid,
                     figure: 'address',
                     restriction_start_time: registeredAddress.restriction_start_time,
                     restriction_end_time: registeredAddress.restriction_end_time },
      "geometry": JSON.parse(registeredAddress.lot_geom)
    }

    return newAddressPolygon;
  }

  $scope.registerAddress = function () {

    var address = formatAddress($scope.newAddress);

    leafletData.getMap('map').then(function(map) {
      $scope.geoSearch.geosearch(address);
    });

    PropertyInfo.registerAddress($scope.selectedCoordinates, address)
      .then(function(registeredAddress) {
        $scope.addresses[registeredAddress.gid] = registeredAddress;
        var newAddressPolygon = createAddressFeature(registeredAddress)
        $scope.addFeature(newAddressPolygon);
      })
  };

  $scope.getRegisteredAddresses = function () {
    PropertyInfo.getRegisteredAddresses().then(function(userAddresses) {
      if (userAddresses) {
        for (var i = 0; i < userAddresses.length; i++) {
          var newAddressPolygon = createAddressFeature(userAddresses[i]);
          $scope.addFeature(newAddressPolygon);
          $scope.addresses[userAddresses[i].gid] = userAddresses[i];
        }
      }
    })
  }

  $scope.getRegisteredAddresses();

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
       $scope.addFeature(newAddressPolygons[a]);
      }
    });
  }

});
