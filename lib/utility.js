var User = require('../db/models/user');
var jwt  = require('jsonwebtoken');

// returns model from users table that corresponds to the
// encrypted data in the JSON Web-Token
exports.getUserFromToken = function (req, callback) {
  var token = req.headers['x-access-token'];
  console.log('token',token);
  if (!token) {
   callback(token);
  } else {
    return jwt.verify(token, 'secret', function(err, decoded) {
      if (err || !decoded) {
      console.log('not decoded');

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