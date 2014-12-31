var User = require('../db/models/user');
var jwt  = require('jsonwebtoken');


exports.getUserFromToken = function (req, callback) {
  var token = req.headers['x-access-token'];
  if (!token) {
   callback(token);
  } else {
    return jwt.verify(token, 'secret', function(err, decoded) {
      if (err || !decoded) {
        callback(decoded);
      } else {
          new User({'username': decoded.username})
              .fetch()
              .then(function(userFound) {

                callback(userFound)
            });;
        }
    });
  }
};