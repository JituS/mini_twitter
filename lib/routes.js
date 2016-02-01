var express = require('express');
var app = express();
var pg = require('pg');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var conString = 'postgresql://postgres:'+process.env.PSQLPASSWORD+'@localhost:'+process.env.PORT+'/twitter';
var client = new pg.Client(conString);
client.connect();
app.set('view engine', 'jade');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.get('/', function(req, res, next){
	res.redirect('html/index.html');
});

app.post('/signup', function(req, res, next){

});

app.post('/html/login', function(req, res, next){
	var name = "\'"+req.body.name+"\'", user;
	var password = "\'"+req.body.password+"\'";
	// client.query('create table if not exist login(username varchar(100),password varchar(15))');
	var query = client.query('select username from login where username = '+name+'and password = '+password);
	query.on('row', function(row){
		user = row;
	});
	query.on('end',function(){
		console.log(user)
		res.render('main.jade', {name: user.username});
	});
});

module.exports = app;