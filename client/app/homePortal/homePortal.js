angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, $http, leafletData, PropertyInfo, $http) {
  var pathsDict = {
    MultiPolygon: {
      type: "MultiPolygon",
      latlng: [[[37.6653423600288, -122.07539899754],
                [37.665224522955,-122.075814597179],
                [37.6654469910699, -122.075508328885],
                [37.6653423600288, -122.07539899754]]]
    }           
  };

  angular.extend($scope, {
    center: {
        lat: 37.65,
        lng: -121.91,
        zoom: 9
    },
    controls: {
      draw: {}
    },
    // tiles: {
    //   url: 'http://api.tiles.mapbox.com/v4/lizport10.kiapnjfg/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
    //   layerOptions: {
    //     apikey: 'pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
    //     mapid: 'lizport10.kiapnjfg'
    //   }
    // },
    paths: {},
    markers: {
      main_marker: {
          lat: 37.65,
          lng: -121.91,
          focus: true,
          message: "Hey, drag me if you want",
          title: "Marker",
          draggable: true
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
      },
      overlays: {
        shapes: {
          name: 'Shapes',
          type: 'group',
          visible: false
        }
      },
      geoJSON : {
        data: {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type":"MultiPolygon",
                "coordinates":[
                  [[37.6653423600288, -122.07539899754],
                  [37.665224522955,-122.075814597179],
                  [37.6654469910699, -122.075508328885],
                  [37.6653423600288, -122.07539899754]]
                  ]
                }}
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
      }
    }
});

 $scope.addShape = function(shape) {
    $scope.paths[shape] = pathsDict[shape];
  };

$scope.addShape('MultiPolygon');

  leafletData.getMap().then(function(map) {
    var drawnItems = $scope.controls.edit.featureGroup;
        map.on('draw:created', function (e) {
        var layer = e.layer;
        drawnItems.addLayer(layer);
        console.log(JSON.stringify(layer.toGeoJSON()));
    });
  });


});

