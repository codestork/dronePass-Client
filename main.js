
var express = require('express');
var morgan      = require('morgan') // used for logging incoming request
var bodyParser  = require('body-parser')

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/client"));
console.log(__dirname + "/client")
app.listen(3000);
