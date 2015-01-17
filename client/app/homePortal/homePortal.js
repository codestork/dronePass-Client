angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $rootScope, $http, $timeout, leafletData, PropertyInfo, DroneSimulator, $q) { 
  
  // so as not to display correct Nav bar
  $rootScope.landing = true; 

  /************** Leaflet Map Property Definition **************/
  //extends $scope with leaflet properties and map tiles necessary to interact with it
  angular.extend($scope, {
    center: {
        lat:  37.65,
        lng: -121.91,
        zoom: 10,
    },
    controls: {
    },
    layers: {
      baselayers: {
        basemap: {
          name: 'Mapbox map',
          type: 'xyz',
          url: 'http://api.tiles.mapbox.com/v4/lizport10.kiapnjfg/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
          layerOptions: {
            apikey: 'pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
              mapid: 'lizport10.kiapnjfg',
          }
        }
      }
    },
    geojson : { 
      data: {
        "type": "FeatureCollection",
        "features": [] // all geoJSON polygons and drone markers go here when registered
      },
      style: function (feature) {return {};}, // allows for custom styling of features
      pointToLayer: function(feature, latlng) { // sets spinning for drone
        var drone = new L.marker(latlng, {icon: L.icon(droneIcon)});
        var currRotation = $scope.droneAnimation.currentRotation;
        var stepTime = $scope.droneAnimation.STEP_TIME;
        var rotationRate = $scope.droneAnimation.rotationRate;

        drone.setIconAngle(currRotation);

        // Rotates the drone in time with distance updates
        if ($scope.droneAnimation.currentRotation < 360){
          $scope.droneAnimation.currentRotation += rotationRate;
        } else {
          $scope.droneAnimation.currentRotation = 0;
        }
        return drone;
      }
  },
  events: {
     map: {
        enable: ['zoomstart', 'drag', 'mousemove'],
        logic: 'emit'
    }
  }

});

  /***************** Utilities ***********************/

  var featureCollection = $scope.featureCollection = $scope.geojson.data.features;

  $scope.addFeatureToMap = function (newFeature, type) {
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

  // adds land parcel polygons to map
  var renderPolygons = function (userAddresses) {
    for (var i = 0; i < userAddresses.length; i++) {
      var newAddressPolygon = createPolygonForAddress(userAddresses[i]);
      $scope.addFeatureToMap(newAddressPolygon, 'polygon');
      $scope.addresses[userAddresses[i].gid] = newAddressPolygon;
      // zooms to first registered address by default
      if(i === 0) {
        $scope.zoomToAddress(newAddressPolygon);
      }
    }
  }

  // formats address for Leaflet geocoding
  var formatAddress = function (addressObj) {
    var addressString= "";
    for (var addressLine in addressObj) {
      addressString = addressString + addressObj[addressLine] + ", ";
    }
    return addressString.substring(0, addressString.length -2)
  }

  var createDroneMarker = function (droneData) {
    var newDrone = {
      "type": "Feature",
      "properties": {"droneID": droneData.callSign,
                      "figure": "drone",
                    },
      "geometry": {
        "type": "Point",
        "coordinates": droneData.locationWGS84
      }
    }
    return newDrone;
  }

  var droneIcon = {
    "iconUrl": "../../assets/drone-icon.png",
    "iconSize": [25, 25], // size of the icon
    "iconAnchor": [12.5, 12.5], // point of the icon which will correspond to marker's location
  }


  var createPolygonForAddress = function (registeredAddress) {
    var newAddressPolygon = {
      "type": "Feature",
      "properties": {gid: registeredAddress.gid,
                     parcel_gid: registeredAddress.parcel_gid,
                     figure: 'address',
                     address: registeredAddress.address,
                     restriction_start_time: registeredAddress.restriction_start_time,
                     restriction_end_time: registeredAddress.restriction_end_time,
                     fillColor: '#CC66FF',
                     weight: 1,
                     opacity: .8,
                     color: '#AB8ACC',
                     dashArray: '1',
                     fillOpacity: 0.7
                   },
      "geometry": JSON.parse(registeredAddress.lot_geom)
    }
    return newAddressPolygon;
  }

  // displays an error message upon receiving a 404 that dims out after 2.5 seconds
  $scope.displayErrorMessage = function (errorMessage) {
    $scope.newError = true;
    $scope.errorMessage = errorMessage;
    if ($scope.newError = true) {
      $timeout(function () {
        $scope.newError = false;  
      }, 2500)
    }
  }
  /***************** Drone Simulator Communications ***********************/

  $scope.drones = {}  
  // socketIO communications, emitting presence and getting drone Coordinates from tower
  // Global Variables to help with drone animation
  var STEP_TIME = 100;
  var FULL_SPIN_TIME = 10000;
  $scope.droneAnimation = {
    STEP_TIME : STEP_TIME,
    currentRotation : 0,
    rotationRate : 360 / (FULL_SPIN_TIME / STEP_TIME)
  };

  var previousDrone = {};
  var currentTime, timeDelta, previousTime;

  setInterval(function () {
    DroneSimulator.emit('CT_allDronesStates', {})
  }, 1000);

  // Gives a change in long and lat needed for each drone tween
  var intervalDeltas = function( prevPt, nextPt, intervals ){
    var deltaX = ( nextPt[0] - prevPt[0] ) / intervals;
    var deltaY = ( nextPt[1] - prevPt[1] ) / intervals;
    return [ deltaX, deltaY ];
  };

  var setTimeoutDroneRender = function(droneToRender, timeTillRendering){
    setTimeout(function(){
      $scope.getDroneCoordinates(droneToRender);
    }, timeTillRendering);
  };

  DroneSimulator.on('TC_update', function (droneData) {
    for(var key in droneData){
      var currentDrone = droneData[key];
      var droneLng = currentDrone.locationWGS84[0]
      var droneLat = currentDrone.locationWGS84[1]
      
      if (currentDrone && $scope.drones[currentDrone.callSign] && droneLat && droneLng) {
        var previousCoordinates = previousDrone[currentDrone.callSign].locationWGS84;
        // If there is a new coordinate set received from the Drone Tower, update the position
        if (previousCoordinates[0] !== droneLng || previousCoordinates[1] !== droneLat){
          currentTime = new Date;
          timeDelta = currentTime - previousTime;
          previousTime = currentTime;
          var nFrames = timeDelta / STEP_TIME;
          var stepDistance = intervalDeltas(previousCoordinates, currentDrone.locationWGS84, nFrames);
          for( var i=0; i<nFrames; i++ ){
            var dronesToRender = {};
            var newLocation = [ previousCoordinates[0] + (i+1)*stepDistance[0], previousCoordinates[1] + (i+1)*stepDistance[1]];
            // renders new drone position as a part of the existing feature collection
            droneToRender = {callSign: previousDrone[currentDrone.callSign].callSign, locationWGS84: newLocation};
            setTimeoutDroneRender(droneToRender, i*STEP_TIME);
          }
        } 
      // If it is a new drone, render it as a part of the feature collection
      } else if (currentDrone) {
        previousTime = new Date;
        $scope.getDroneCoordinates(currentDrone);
      }
      previousDrone[currentDrone.callSign] = currentDrone;
    }
  });


  // adds Drone to map as new feature
  $scope.beginDroneFlight = function (droneData) {
    var newDrone = createDroneMarker(droneData)
    $scope.addFeatureToMap(newDrone, 'drone');
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

  // updates drone positions based on coordinates
  $scope.renderDronePositions = function () {
    for (var i = 0; i < featureCollection.length; i++) {
      if (featureCollection[i].properties.figure === 'drone') {
        var id = featureCollection[i].properties.droneID;
        featureCollection[i].geometry.coordinates = $scope.drones[id].geometry.coordinates;
      }
    }
  };

  $scope.getDroneCoordinates = function (droneData) {
    var deferred = $q.defer()
    deferred.promise.then(function(){
      if ($scope.drones[droneData.callSign]) {
        $scope.drones[droneData.callSign] = createDroneMarker(droneData)
      } else {
        $scope.beginDroneFlight(droneData)
      }
      // ToDo: Add event listener for end of drone Flight
    }).then(function(){
      $scope.renderDronePositions()
    })

    deferred.resolve();
  };

  /************** Address Selection ***************************/
  $scope.selectedCoordinates =[];

  // enables address search
  leafletData.getMap('map').then(function(map) {
   $scope.geoSearch = new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.Google(),
    });
   $scope.geoSearch.addTo(map);
   $scope.geoSearch._config.zoomLevel = 15;
  });

  // centers map on coordinates of given address
  $scope.zoomToAddress = function (address) {
    var coordinates = address.geometry.coordinates[0][0][0]
    $scope.center = {
        lat: coordinates[1],
        lng: coordinates[0],
        zoom: 15
    }
  };

  /***************** Address Registry ***********************/
  $scope.addresses = {};

  $scope.newAddress = {};

  leafletData.getMap('map').then(function(map) {
    map.on('geosearch_showlocation', function (result) {
      // checks if the address being searched is as the result of a register button
      // does not follow through with registry on search bar search
      if ($scope.registryAddress) {
        $scope.selectedCoordinates = [result.Location.X, result.Location.Y];
        $scope.registerAddressInDB();
        $scope.registryAddress = null;
      }
    });
  });

  $scope.registerAddressInDB = function () {
    PropertyInfo.registerAddress($scope.selectedCoordinates, $scope.registryAddress)
        .then(function(registeredAddress) {
          var newAddressPolygon = createPolygonForAddress(registeredAddress);
          $scope.addresses[registeredAddress.gid] = newAddressPolygon;
          $scope.addFeatureToMap(newAddressPolygon, 'polygon');
          $scope.zoomToAddress(newAddressPolygon);
      }).catch(function (error) {
       $scope.displayErrorMessage(error.data);
    });
    // clears form
    for (var addressLine in $scope.newAddress) {
      $scope.newAddress[addressLine] = "";
    }
  };
  
  $scope.registerAddress = function () {
    //formats address for geosearching
    $scope.registryAddress = formatAddress($scope.newAddress);
    //geocoding for formatted address
    leafletData.getMap('map').then(function(map) {
        $scope.geoSearch.geosearch($scope.registryAddress);
    });
  };

/**************** Other Address Restrictions ***************/

  $scope.getRegisteredAddresses = function () {
    PropertyInfo.getRegisteredAddresses().then(function(userAddresses) {
      if (userAddresses) {
        renderPolygons(userAddresses);
      }
    }).catch(function (error) {
        $scope.displayErrorMessage(error.data);
      });
  }

  $scope.getRegisteredAddresses();

  // deletes selectedAddress
  $scope.removeAddress = function (address) {
    var gid = address.properties.gid;
    PropertyInfo.removeAddress(gid)
      .then(function() {
        delete $scope.addresses[gid];
        for(var i = 0; i < featureCollection.length; i++) {
          if (gid === featureCollection[i].properties.gid){
            featureCollection.splice(i, 1);
          } 
        }
      }).catch(function (error) {
        $scope.displayErrorMessage(error.data);
      });
  }

  $scope.times = {
    restriction_start_time: new Date( Date.UTC(2014,12,31) ), // picked arbitrary date to have it display at hour
    restriction_end_time: new Date( Date.UTC(2014,12,31) )
  }

  $scope.updatePermission = function (address) {
    // if the user has entered restrictions, format. Else set restriction times to null.
    if ($scope.times.restriction_end_time && $scope.times.restriction_start_time) {
      restriction_start_time= moment($scope.times.restriction_start_time).format('HH:mm:ss')
      restriction_end_time= moment($scope.times.restriction_end_time).format('HH:mm:ss')
    } else {
      restriction_start_time= null;
      restriction_end_time= null;
    }

    PropertyInfo.updatePermission(address.properties, restriction_start_time, restriction_end_time)
      .then(function(updatedAddress) {
        var newAddressPolygon = createPolygonForAddress(updatedAddress);
        $scope.addresses[updatedAddress.gid] = newAddressPolygon;
        $scope.addFeatureToMap(newAddressPolygon, 'polygon');
      }).catch(function (error) {
        $scope.displayErrorMessage(error.data);
      });
  }

});
