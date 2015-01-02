angular.module('dronePass.droneSimulator', [])

  .factory('DroneSimulator', function () {
    var getDroneCoordinates = function () {
      return $http({
        method: 'GET',
        url: '/getCoordinates',
      })
      .then(function (res) {
        return res.data;

        // expect object or array with set of geojson data, i.e:
        //res.data = 
        // { "droneID1" : {
        //   "type":"Point",
        //   "coordinates":[30, 120]
        //   },
        // "droneID2" : {
        //   "type":"Point",
        //   "coordinates":[80, 121]
        //   },
        //   "droneID3" : {
        //     "type":"Point",
        //     "coordinates":[32, 124]
        //   },
      });
    }
// Test run
    // var getDroneCoordinates = function (x,y) {
    //   return {"droneID1": {
    //       "type":"Point",
    //       "coordinates":[x + .01, y + .01]
    //       },
    //         "droneID2" : {
    //         "type":"Point",
    //         "coordinates":[x+ .02, y + .02]
    //       },
    //       "droneID3" : {
    //         "type":"Point",
    //         "coordinates":[x + .03, y + .03]
    //       },
    //   };
    // } 

    return {
      getDroneCoordinates: getDroneCoordinates
    }
  });