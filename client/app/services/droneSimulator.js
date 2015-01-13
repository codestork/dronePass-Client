angular.module('dronePass.droneSimulator', [])
.factory('DroneSimulator', function (socketFactory) {

    return socketFactory({
      ioSocket: io.connect('http://tower.dronepass.org:8080')
    });

})

