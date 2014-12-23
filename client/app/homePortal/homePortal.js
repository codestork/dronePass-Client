angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope, leafletData, PropertyInfo, $http) {
  
  angular.extend($scope, {
    center: {
        lat: 37.65,
        lng: -121.91,
        zoom: 9
    },
    controls: {
      draw: {}
    },
    tiles: {
      url: 'http://api.tiles.mapbox.com/v4/lizport10.kiapnjfg/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
      layerOptions: {
        apikey: 'pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ',
        mapid: 'lizport10.kiapnjfg'
      }
    }
  })


    leafletData.getMap().then(function(map) {
      var drawnItems = $scope.controls.edit.featureGroup;
          map.on('draw:created', function (e) {
          var layer = e.layer;
          drawnItems.addLayer(layer);
          console.log(JSON.stringify(layer.toGeoJSON()));
      });
    });


// var popup = L.popup();
    // var polygon = L.polygon({"type":"MultiPolygon","coordinates":[[37.832109, -122.258188],[37.852715, -122.273981],[37.821805, -122.297327],[37.832109, -122.258188]]}).addTo(map);


});

  // var map = new mapboxgl.Map({
  //   container: 'leaflet', // container id
  //   style: 'https://www.mapbox.com/mapbox-gl-styles/styles/outdoors-v6.json', //stylesheet location
  //   center: {
  //     lat: 37.65,
  //     lng: -121.91,
  //   }, // starting position
  //   zoom: 9
  // });
