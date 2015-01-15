angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $rootScope, $http, $timeout, leafletData, PropertyInfo, DroneSimulator, $q) { 
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
        "features": []
      },
      style: function (feature) {return {};},
      pointToLayer: function(feature, latlng) {
        var drone = new L.marker(latlng, {icon: L.icon(droneIcon)});
        var currRotation = $scope.droneAnimation.currentRotation;
        var stepTime = $scope.droneAnimation.STEP_TIME;
        var rotationRate = $scope.droneAnimation.rotationRate;

        drone.setIconAngle(currRotation);

        // ROTATE THE DRONE
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
      $scope.addresses[userAddresses[i].gid] = newAddressPolygon;
      if(i === 0) {
        $scope.zoomToAddress(newAddressPolygon);
      }
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


  var createAddressFeature = function (registeredAddress) {

    var newAddressPolygon = {
      "type": "Feature",
      "properties": {gid: registeredAddress.gid,
                     parcel_gid: registeredAddress.parcel_gid,
                     figure: 'address',
                     address: registeredAddress.address,
                     restriction_start_time: registeredAddress.restriction_start_time,
                     restriction_end_time: registeredAddress.restriction_end_time,
                     fillColor: '#CC66FF',
                     weight: 3,
                     opacity: .8,
                     color: '#AB8ACC',
                     dashArray: '1',
                     fillOpacity: 0.7
                   },
      "geometry": JSON.parse(registeredAddress.lot_geom)
    }

    return newAddressPolygon;
  }

  
  $scope.displayErrorMessage = function (errorMessage) {
    $scope.newError = true;
    $scope.errorMessage = errorMessage;
    if ($scope.newError = true) {
      $timeout(function () {
        $scope.newError = false;  
      }, 2500)
    }
  }
  /***************** Drone Simulator ***********************/

  $scope.drones = {}

  // Global Variables to help with drone animation
  var STEP_TIME = 100;
  var FULL_SPIN_TIME = 10000;
  $scope.droneAnimation = {};
  $scope.droneAnimation.STEP_TIME = STEP_TIME;
  $scope.droneAnimation.currentRotation = 0;
  $scope.droneAnimation.rotationRate = 360 / (FULL_SPIN_TIME / STEP_TIME);
  //**************************************************************


  setInterval(function () {
    DroneSimulator.emit('CT_allDronesStates', {})}, 1000);

  // Gives a change in long and lat needed for each drone tween
  var intervalDeltas = function( prevPt, nextPt, intervals ){
    var deltaX = ( nextPt[0] - prevPt[0] ) / intervals;
    var deltaY = ( nextPt[1] - prevPt[1] ) / intervals;
    return [ deltaX, deltaY ];
  }

  var prevDrone = {};
  var currTime, timeDelta, prevTime;

  DroneSimulator.on('TC_update', function (droneData) {

    for(var key in droneData){
      var currDrone = droneData[key];
      // If there is a new batch of drone movements submitted
      if (currDrone && $scope.drones[currDrone.callSign]) {
        if (prevDrone[currDrone.callSign].locationWGS84[0] !== currDrone.locationWGS84[0] || prevDrone[currDrone.callSign].locationWGS84[1] !== currDrone.locationWGS84[1]){
          // console.log("NEW MOVE")
          currTime = new Date;
          timeDelta = currTime - prevTime;
          prevTime = currTime;
          var nFrames = timeDelta / STEP_TIME;
          var stepDist = intervalDeltas(prevDrone[currDrone.callSign].locationWGS84, currDrone.locationWGS84, nFrames);
          for( var i=0; i<nFrames; i++ ){
            var dronesToRender = {};
            var newLocation = [ prevDrone[currDrone.callSign].locationWGS84[0] + (i+1)*stepDist[0], prevDrone[currDrone.callSign].locationWGS84[1] + (i+1)*stepDist[1]];
            droneToRender = {callSign: prevDrone[currDrone.callSign].callSign, locationWGS84: newLocation};
            var setTimeoutRender = function(renderObj, timeTillRender){
              setTimeout(function(){
                $scope.getDroneCoordinates(renderObj);
              }, timeTillRender);
            }
            setTimeoutRender(droneToRender, i*STEP_TIME);
          }
          prevDrone[currDrone.callSign] = currDrone;
      // If there the drone coordinates are the same as before
        } else {
          // console.log("OLD MOVE")
          prevDrone[currDrone.callSign] = currDrone;
        }
      // If it is a new drone, render it
      } else if (currDrone) {
        // console.log("NEW DRONE")
        prevTime = new Date;
        $scope.getDroneCoordinates(currDrone);
        prevDrone[currDrone.callSign] = currDrone;
      }

    }
  });


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
      } else {
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


  /************** Address Selection ***************************/
  // Allows user to select address based on search, form entry, or click 
  $scope.selectedCoordinates =[];
  // enables address search
  leafletData.getMap('map').then(function(map) {
   $scope.geoSearch = new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.Google(),
    });
   $scope.geoSearch.addTo(map);
   $scope.geoSearch._config.zoomLevel = 15;
  });


  leafletData.getMap('map').then(function(map) {
    map.on('geosearch_showlocation', function (result) {
    });
  });

  $scope.zoomToAddress = function (address) {
    var coordinates = address.geometry.coordinates[0][0][0]
    $scope.center = {
        lat: coordinates[1],
        lng: coordinates[0],
        zoom: 15
    }
  };

  /***************** Database Requests ***********************/
  $scope.addresses = {};

  $scope.newAddress = {};

  $scope.registerAddress = function () {
    var newAddress = formatAddress($scope.newAddress);
    var deferred = $q.defer();
    // refactor later;
    deferred.promise.then(function (){
      leafletData.getMap('map').then(function(map) {
          map.on('geosearch_foundlocations', function (result) {
          $scope.selectedCoordinates = [result.Locations[0].X, result.Locations[0].Y];
          PropertyInfo.registerAddress($scope.selectedCoordinates, newAddress)
          .then(function(registeredAddress) {
            var newAddressPolygon = createAddressFeature(registeredAddress);
            $scope.addresses[registeredAddress.gid] = newAddressPolygon;
            $scope.addFeature(newAddressPolygon, 'polygon');
            $scope.zoomToAddress(newAddressPolygon);
          }).catch(function (error) {
          $scope.displayErrorMessage(error.data);
          });
        });
      });
    }).then(function () {
      leafletData.getMap('map').then(function(map) {
        $scope.geoSearch.geosearch(newAddress);
       });
      for (var addressLine in $scope.newAddress) {
        $scope.newAddress[addressLine] = "";
      }
    })

    deferred.resolve();

  };

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
    restriction_start_time: null,
    restriction_end_time: null
  }

  $scope.updatePermission = function (address) {
    
    if ($scope.times.restriction_end_time && $scope.times.restriction_start_time) {
      restriction_start_time= moment($scope.times.restriction_start_time).format('HH:mm:ss')
      restriction_end_time= moment($scope.times.restriction_end_time).format('HH:mm:ss')
    } else {
      restriction_start_time= null;
      restriction_end_time= null;
    }

    PropertyInfo.updatePermission(address.properties, restriction_start_time, restriction_end_time)
      .then(function(updatedAddress) {
        var newAddressPolygon = createAddressFeature(updatedAddress);
        $scope.addresses[updatedAddress.gid] = newAddressPolygon;
        $scope.addFeature(newAddressPolygon, 'polygon');
      }).catch(function (error) {
        $scope.displayErrorMessage(error.data);
      });
  }

});
