angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $http, leafletData, PropertyInfo, $http) { 
  $scope.addresses = PropertyInfo.addresses;

  angular.extend($scope, {
    center: {
        lat:  37.65,
        lng: -121.91,
        zoom: 10,
        autodiscover: true
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
  /************** Map Focus ***************************/
  // Centers Map based on IP address
  // $scope.centerMapOnIP = function (ip) {
  //   var url = "http://freegeoip.net/json/" + ip;
  //   $http.get(url).success(function(res) {
  //     console.log(res);
  //     $scope.center = {
  //       lat: res.latitude,
  //       lng: res.longitude,
  //       zoom: 10
  //     }
  //     $scope.ip = res.ip;
  //     console.log(res);
  //   })
  // };

  // $scope.centerMapOnIP();

  /************** Address Selection ***************************/
  // Allows user to select address based on search, form entry, or click 
  $scope.selectedCoordinates =[];

  // enables address search
  leafletData.getMap('map').then(function(map) {
    new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.OpenStreetMap()
    }).addTo(map);
  });

  // adds searched Coordinates to selected for DB query
  leafletData.getMap('map').then(function(map, $scope) {
    map.on('geosearch_showlocation', function (result) {
      $scope.selectedCoordinates = [result.Location.X, result.Location.Y]
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

  // $scope.getAddresses();

});


   // tiles: {
    //   url: 'http://api.tiles.mapbox.com/v4/lizport10.kiapnjfg/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
    //   layerOptions: {
    //     apikey: 'pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
    //     mapid: 'lizport10.kiapnjfg'
    //   }
    // },

  // Get the countries geojson data from a JSON // insert url in the get request
  // $http.get().success(function(data, status) {
  //     angular.extend($scope, {
  //         geojson: {
  //             data: data,
  //             style: {
  //                 fillColor: "green",
  //                 weight: 2,
  //                 opacity: 1,
  //                 color: 'white',
  //                 dashArray: '3',
  //                 fillOpacity: 0.7
  //             }
  //         }
  //     });
  // });

// leafletData.getMap().then(function(map) {
//   map.on('click', function(e) {
//     alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
//   });
// });

// var pathsDict = {
//   multiPolygon: {
//     type: "multiPolygon",
//     latlngs: [
//                 [{lat:37.6653423600288, lng:-122.07539899754},{lat: 37.665224522955,lng:-122.075814597179}, {lat: 37.6654469910699, lng: -122.075508328885}, {lat:37.6653423600288,  lng: -122.07539899754}]
//               ]
//   }           
// };
// need to extend $scope with paths: {}, again if use this

// $scope.addShape = function(shape) {
//   $scope.paths[shape] = pathsDict[shape];
// };

// $scope.addShape("multiPolygon")

// markers: {
//   main_marker: {
//       lat: 37.65,
//       lng: -121.91,
//       focus: true,
//       message: "Home",
//       title: "Alameda County",
//       draggable: false
//   }
// },

//Example polygons
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
