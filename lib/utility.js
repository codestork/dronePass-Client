var request = require('request');

exports.isLoggedIn = function (req, res) {
  return req.session ? !!req.session.user : false;
};

exports.checkUser = function (req, res, next) {
  if (!exports.isLoggedIn(req)) {
    res.status(404);
  } else {
    next();
  }
};

exports.createSession = function (req, res, newUser) {
  return req.session.regenerate(function () {
      req.session.user = newUser;
      res.status(200);
    });
};
