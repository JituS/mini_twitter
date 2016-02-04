var express = require('express');
var moment = require('moment');
var app = express();
var pg = require('pg');
var ld = require('lodash');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var conString = 'postgresql://postgres:'+process.env.PSQLPASSWORD+'@localhost:'+process.env.PORT+'/twitter';
var client = new pg.Client(conString);
client.connect();

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


var convertInSQLFormate = function(string){
	return "\'"+string+"\'";
};

var login = function(id, res, next){
	res.send({link:'main.html'});
};

app.get('/', function(req, res, next){
	if(req.cookies.id){
		var id = convertInSQLFormate(req.cookies.id);
		var query = client.query('select id from login where id='+id);
		query.on('row', function(row){
			id = row;
		});
		query.on('end', function(){
			if(id) res.redirect('/html/main.html');
			else res.redirect('/html/index.html');
		});
	}else res.redirect('/html/index.html');
});

var string = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
var randomString = function(){
	var random = '';
	for(var i = 0; i < string.length/4; i++){
		var number = ld.random(0,string.length-1);
		random+=string[number];
	};
	return random;
};

app.post('/html/signup', function(req, res, next){
	var name = convertInSQLFormate(req.body.name);
	var email = convertInSQLFormate(req.body.email);
	var DOB = convertInSQLFormate(req.body.dob);
	var password = convertInSQLFormate(req.body.password);
	var uniqueTable = randomString();
	var unique = convertInSQLFormate(uniqueTable);
	client.query('create table if not exists login(id varchar(20) primary key,username varchar(100) not null,email varchar(100) unique not null,dob date,password varchar(15), followers varchar(5000))');
	client.query('create table if not exists posts(userId varchar(20), name varchar(100), content varchar(1000), moment date)');
	client.query('insert into login values('+unique+','+name+','+email+','+DOB+','+password+')', function(err, result){
		if(err) res.send(err.detail);
	});
});

app.post('/html/login', function(req, res, next){
	var password = convertInSQLFormate(req.body.password), user;
	var name = convertInSQLFormate(req.body.name);
	client.query('create table if not exists posts(userId varchar(20), name varchar(100), content varchar(1000), moment date)');
	var query = client.query('select id, username from login where username='+name+'and password='+password);
	query.on('row', function(row){
		user = row;
	});
	query.on('end', function(){
		if(user){
			res.cookie('id', user['id']);
			res.cookie('name', user['username']);
			login(user['id'], res, next);
		}else{
			console.log('error');
		}
	});
});

app.get('/html/currentUserInfo', function(req, res, next){
	var cookie = req.cookies, post = [], a, followers;
	if(cookie.id){
		var id = req.cookies.id, user;
		var query1 = client.query("select name, content, moment from posts where userId ='"+id+"'", function(err, result){
			if(err) console.log(err);
			a = result.rows;
		});
		query1.on('end', function(){
			var query2 = client.query("select followers from login where id ='"+id+"'")
			query2.on('row', function(row){
				followers = row.followers;

			});
				query2.on('end', function(){
					if(followers){
						followers = followers || '[]';
						followers = JSON.parse(followers);
						for(var i = 0; i < followers.length; i++){
							var query3 = client.query("select name, content, moment from posts where userId ='"+followers[i]+"'");
							query3.on('row',function(row){
								a.push(row);
							})
							if(i == followers.length-1){
								query3.on('end', function(){
									res.end(JSON.stringify(a))
								})
							}
						}
					}else{
						res.end(JSON.stringify(a));
					}
				});
		});
	}
});

app.post('/html/newPost', function(req, res, next){
	var cookie = req.cookies;
	if(cookie.id){
		client.query('create table if not exists posts(userId varchar(20), name varchar(100), content varchar(1000), moment date)');
		var name = convertInSQLFormate(cookie.name);
		var id = convertInSQLFormate(cookie.id);
		var content = convertInSQLFormate(req.body.content);
		var query = client.query("insert into posts values("+id+","+name+","+content+",'"+moment().format("DD-MM-YYYY")+"')", function(err){
			if(err){
				res.send(err.detail);
			};
		});
	}
});

app.get('/html/users',function(req, res, next){
	var query = client.query('select username from login');
	var users = [];
	query.on('row', function(row){
		users.push(row);
	});
	query.on('end',function(){
		res.json(users);
	});
});

app.post('/html/logout', function(req, res){
	res.clearCookie('id');
	res.send({link:'index.html'});
});

app.post('/html/userSearch', function(req, res){
	var name = convertInSQLFormate(req.body.name);
	var query = client.query('select username, email from login where username='+name);
	var searchResult = [];
	query.on('row', function(row){
		searchResult.push(row);
	});
	query.on('end', function(){
		res.json(searchResult);
	});	
});

app.post('/html/follow', function(req, res, next){
	var email = convertInSQLFormate(req.body.email), id = convertInSQLFormate(req.cookies.id);
	var query = client.query('select followers from login where id='+id), followers;
	query.on('row', function(row){
		followers = row.followers;
	});
	query.on('end', function(){
		followers = followers || JSON.stringify([]);
		var query = client.query('select id from login where email='+email), userId;
		query.on('row', function(row){
			userId = row.id;
		});
		query.on('end', function(){
			var updated = JSON.parse(followers);
			!ld.includes(updated, userId) && updated.push(userId);
			updated = JSON.stringify(updated);
			console.log(updated);
			client.query("update login set followers='"+updated+"'where id="+id, function(err){
				console.log(err);
			});
		});
	});
});

module.exports = app;