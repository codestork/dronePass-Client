
var express = require('express');
var morgan = require('morgan'); // used for logging incoming request
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');
var partials = require('express-partials');
var cookieParser = require('cookie-parser');
var util = require('./lib/utility');
var handler = require('./lib/request-handler');

var app = express();
var port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './client')));
app.use(cookieParser('shhhh, very secret'));

app.use(session({
  secret: 'shhhh, very secret',
  resave: false,
  saveUninitialized: true
}));

app.post('/login', handler.loginUser);
app.get('/logout', handler.logoutUser);
app.post('/signup', handler.signupUser);

//[ToDo: Set up authentication token request from Planning Server once a user logs in];


app.listen(port);
console.log('You are now logged into port ' + port);