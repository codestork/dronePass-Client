angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $rootScope, $http, leafletData, PropertyInfo, DroneSimulator, $q) { 
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

$rootScope.landing = true;
   /***************** Utilities ***********************/

  var featureCollection = $scope.featureCollection = $scope.geojson.data.features;

  $scope.addFeature = function (newFeature, type) {
    var id;
    if (type === 'drone') {
      id = 'droneID'
    } else if (type === 'polygon') {
      id = 'gid'
    }
    for (var i = 0; i < featureCollection.length; i++) {
      if (featureCollection[i].properties[id] === newFeature.properties[id]) {
        featureCollection[i] = newFeature;
        return;
      }
    }
    featureCollection.push(newFeature);
  };

  var renderPolygons = function (userAddresses) {
    for (var i = 0; i < userAddresses.length; i++) {
      var newAddressPolygon = createAddressFeature(userAddresses[i]);
      $scope.addFeature(newAddressPolygon, 'polygon');
      $scope.addresses[userAddresses[i].gid] = userAddresses[i];
    }
  }

  var formatAddress = function (addressObj) {
    var addressString= "";
    for (var addressInput in addressObj) {
      addressString = addressString + addressObj[addressInput] + ", ";
    }
    return addressString.substring(0, addressString.length -2)
  }

  var formatDrone = function (droneData) {
    var newDrone = {
      "type": "Feature",
      "properties": {"droneID": droneData.callSign, "figure": "drone"},
      "geometry": {
        "type": "Point",
        "coordinates": droneData.location
      }
    }
    return newDrone;
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
  /***************** Drone Simulator ***********************/

  $scope.drones = {}
  
  setInterval(function () {
    DroneSimulator.emit('reportIn', {})}, 1000);

  DroneSimulator.on('update', function (droneData) {
    $scope.getDroneCoordinates(droneData);
  })


  $scope.beginDroneFlight = function (droneData) {
    var newDrone = formatDrone(droneData)
    $scope.addFeature(newDrone, 'drone');
    $scope.drones[droneData.callSign] = newDrone;
  }

  $scope.endDroneFlight = function (droneID) {
    delete $scope.drones[droneID];
    for (var i = 0; i < featureCollection.length; i++){
      if (featureCollection[i].properties.droneID === droneID) {
        featureCollection.splice(i, 1);
      }
    }
  }

  $scope.getDroneCoordinates = function (droneData) {

    var deferred = $q.defer()

    deferred.promise.then(function(){
      if ($scope.drones[droneData.callSign]) {
        $scope.drones[droneData.callSign] = formatDrone(droneData)
      }else {
        $scope.beginDroneFlight(droneData)
      }

      // ToDo: Add event listener for end of drone Flight

    }).then(function(){
      $scope.renderDronePositions()
    })

    deferred.resolve();
  };
  
  $scope.renderDronePositions = function () {
    for (var i = 0; i < featureCollection.length; i++) {
      if (featureCollection[i].properties.figure === 'drone') {
        var id = featureCollection[i].properties.droneID;
        featureCollection[i].geometry.coordinates = $scope.drones[id].geometry.coordinates;
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

  leafletData.getMap('map').then(function(map) {
    map.on('geosearch_showlocation', function (result) {
      console.log('pin down')
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


  /***************** Database Requests ***********************/
  $scope.addresses = {};

  $scope.newAddress = {};

  $scope.registerAddress = function () {
    var deferred = $q.defer()
    // refactor later;
    deferred.promise.then(function(){
      $scope.newAddress = formatAddress($scope.newAddress);
    }).then(function(){
      leafletData.getMap('map').then(function(map) {
        map.on('geosearch_foundlocations', function (result) {
        $scope.selectedCoordinates = [result.Locations[0].X, result.Locations[0].Y];
        console.log($scope.selectedCoordinates);
        console.log($scope.newAddress);
        PropertyInfo.registerAddress($scope.selectedCoordinates, $scope.newAddress)
        .then(function(registeredAddress) {
          $scope.addresses[registeredAddress.gid] = registeredAddress;
          var newAddressPolygon = createAddressFeature(registeredAddress)
          $scope.addFeature(newAddressPolygon, 'polygon');
        });
        });
      });
    }).then(function () {
      leafletData.getMap('map').then(function(map) {
        $scope.geoSearch.geosearch($scope.newAddress);
    });
    });

    deferred.resolve();
    
  };

  $scope.getRegisteredAddresses = function () {
    PropertyInfo.getRegisteredAddresses().then(function(userAddresses) {
      if (userAddresses) {
        renderPolygons(userAddresses);
      }
    })
  }

  $scope.getRegisteredAddresses();

  // deletes selectedAddress
  $scope.removeAddress = function (address) {
    var gid = address.gid;
    console.log(gid);
    PropertyInfo.removeAddress(gid)
      .then(function() {
        delete $scope.addresses[gid];
        for(var i = 0; i < featureCollection.length; i++) {
          if (gid === featureCollection[i].properties.gid){
            featureCollection.splice(i, 1);
          } 
        }
      })
  }

  $scope.togglePermissions = function (address, restriction_start_time, restriction_end_time) {
    if (restriction_end_time && restriction_start_time) {
      restriction_start_time= moment(restriction_start_time).format('hh:mm:ss')
      restriction_end_time= moment(restriction_end_time).format('hh:mm:ss')
    }
    PropertyInfo.togglePermissions(address, restriction_start_time, restriction_end_time)
      .then(function(toggledAddress) {
        $scope.addresses[toggledAddress.gid] = toggledAddress;
        var newAddressPolygon = createAddressFeature(toggledAddress);
        $scope.addFeature(newAddressPolygon, 'polygon');
      });
  }

});
