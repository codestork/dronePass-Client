var express = require('express');
var morgan = require('morgan'); 
var bodyParser = require('body-parser');
var path = require('path');
var util = require('./lib/utility');
var authHandler = require('./lib/auth-request-handler');
var parcelHandler = require('./lib/parcel-request-handler');
var db = require('./db/config.js');


var app = express();
var port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './client')));

app.listen(port);
console.log('You are now logged into port ' + port);


/*************** API Endpoints *********************/

app.post('/signin', authHandler.signinUser);
app.post('/signup', authHandler.signupUser);
app.post('/signout', authHandler.signoutUser);
app.get('/checkAuthentication', authHandler.checkAuthentication);
app.delete('/removeUser', authHandler.removeUser);
app.post('/registerAddress', parcelHandler.registerAddress);
app.delete('/removeAddress/:gid', parcelHandler.removeAddress);
app.get('/getRegisteredAddresses', parcelHandler.getRegisteredAddresses);
app.post('/updatePermission', parcelHandler.updatePermission);
app.post('/setExemption', parcelHandler.setExemption);
app.delete('/removeExemption/:exemptionID', parcelHandler.removeExemption);
app.get('/getExemptions', parcelHandler.getExemptions);

