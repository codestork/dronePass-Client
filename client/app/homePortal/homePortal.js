angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $http, leafletData, PropertyInfo, $http) {
  

  // var pathsDict = {
  //   multiPolygon: {
  //     type: "multiPolygon",
  //     latlng: [[ -121.07539899754, 37.6653423600288],
  //               [-122.075814597179, 38.665224522955],
  //               [-122.075508328885, 37.6654469910699],
  //               [ -121.07539899754, 37.6653423600288]]
  //   }           
  // };

  angular.extend($scope, {
    address : $scope.address,
    center: {
        lat: 37.65,
        lng: -121.91,
        zoom: 9
    },
    controls: {
      draw: {}
      // geosearch: geosearch
    },
    paths: {},
    markers: {
      main_marker: {
          lat: 37.65,
          lng: -121.91,
          focus: true,
          message: "Home",
          title: "Alameda County",
          draggable: false
      }
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
        "features": [
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type":"MultiPolygon",
              "coordinates":[[
                [[ -121.07539899754, 37.6653423600288],
                [-122.075814597179, 38.665224522955],
                [-122.075508328885, 37.6654469910699],
                [ -121.07539899754, 37.6653423600288]]
                ]]
              }
            }
          ]
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
          enable: ['zoomstart', 'drag', 'click', 'mousemove'],
          logic: 'emit'
      }
    }
  });
  
  leafletData.getMap().then(function(map) {
      var drawnItems = $scope.controls.edit.featureGroup;
      map.on('draw:created', function (e) {
      var layer = e.layer;
      drawnItems.addLayer(layer);
      console.log(JSON.stringify(layer.toGeoJSON()));
    });
  });

  var pathsDict = {
    multiPolygon: {
      type: "multiPolygon",
      latlngs: [
                  [{lat:37.6653423600288, lng:-122.07539899754},{lat: 37.665224522955,lng:-122.075814597179}, {lat: 37.6654469910699, lng: -122.075508328885}, {lat:37.6653423600288,  lng: -122.07539899754}]
                ]
    }           
  };

  $scope.addShape = function(shape) {
    $scope.paths[shape] = pathsDict[shape];
  };

  $scope.addShape("multiPolygon")

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
  leafletData.getMap().then(function(map, $scope) {
    map.on('geosearch_showlocation', function (result) {
      L.marker([result.x, result.y]).addTo(map)
    });
  });

});

   // tiles: {
    //   url: 'http://api.tiles.mapbox.com/v4/lizport10.kiapnjfg/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
    //   layerOptions: {
    //     apikey: 'pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
    //     mapid: 'lizport10.kiapnjfg'
    //   }
    // },




