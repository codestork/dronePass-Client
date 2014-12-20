angular.module('dronePass.homePortal', [])

.controller('HomePortalController', function ($scope) {
//   permissions logic goes here
  var layer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/lizport10.kh0po5pb/{z}/{x}/{y}.png',{
  maxZoom: 18
  });

  mapboxgl.accessToken = 'pk.eyJ1IjoibGl6cG9ydDEwIiwiYSI6IkNnaGZuam8ifQ.ytq8ZMrhPrnoWQsPnfkZMQ';
// Create a map in the div #map
  var map = new mapboxgl.Map({
    container: 'map',
    // style: 'path/to/style.json'
  });
  map.addLayer(layer);

});