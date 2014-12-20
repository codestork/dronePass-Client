
var express = require('express');
var morgan = require('morgan'); // used for logging incoming request
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
var port = 3000;

app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());     
app.use(express.static(path.join(__dirname, './client')));
// console.log(path.join(__dirname, './client'))
app.listen(port);
console.log('Server now listening on port ' + port);