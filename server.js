var http = require('http');
var app = require('./lib/routes.js');
var server = http.createServer(app);
server.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000, process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");