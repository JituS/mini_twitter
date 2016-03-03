var http = require('http');
var app = require('./lib/routes.js');
var server = http.createServer(app);
server.listen(3000);