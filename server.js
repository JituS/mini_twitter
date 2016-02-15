var http = require('http');
var app = require('./lib/routes.js');
http.createServer(app).listen(3000);