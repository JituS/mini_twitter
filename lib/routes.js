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
	client.query('create table if not exists login(id varchar(50) primary key,username varchar(100) not null,password varchar(15) not null,email varchar(100) unique not null);');
	client.query('create table if not exists posts(postid serial,userid varchar(50) references login(id),moment date,content varchar(1000), likes numeric(10));');
	client.query('create table if not exists following(userid varchar(50),followerid varchar(50), primary key(userid, followerid));');
	client.query('create table if not exists likes(postid numeric(10),likerid varchar(50),primary key(postid, likerid));')
	if(req.cookies.id){
		var id = convertInSQLFormate(req.cookies.id);
		var query = client.query('select id from login where id='+id, function(err, result){
			if(result.rows.length) res.redirect('/html/main.html');
			else res.redirect('/html/index.html');
		});
	}else res.redirect('/html/index.html');
});

var randomString = function(){
	var string = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
	var random = '';
	for(var i = 0; i < string.length/4; i++){
		var number = ld.random(0,string.length-1);
		random+=string[number];
	};
	return random;
};

app.post('/html/signup', function(req, res, next){
	var id = convertInSQLFormate(randomString());
	var name = convertInSQLFormate(req.body.name);
	var password = convertInSQLFormate(req.body.password);
	var email = convertInSQLFormate(req.body.email);
	
	client.query('insert into login values('+id+','+name+','+password+','+email+')', function(err){
		if(err) res.send(err.detail);
	});
});

app.post('/html/login', function(req, res, next){
	var password = convertInSQLFormate(req.body.password), user;
	var name = convertInSQLFormate(req.body.name);
	var query = client.query('select id, username from login where username='+name+'and password='+password, function(err, result){
		if(result.rows[0]){
			res.cookie('id', result.rows[0]['id']);
			res.cookie('name', result.rows[0]['username']);
			login(result['id'], res, next);
		}else console.log('error');
	});
});

app.get('/html/getProfile', function(req, res, next){
	var cookie = req.cookies, post, followers, ids;
	if(cookie.id){
		var id = convertInSQLFormate(cookie.id);
		var query1 = client.query("select posts.*, login.username from posts, login where posts.userid = " + id + "and login.id="+id, function(err, result){
			post = result.rows;
		});
		query1.on('end', function(){
			var query2 = client.query("select followerid from following where userid ="+id, function(err, result){
				ids = result.rows;
			});
			query2.on('end', function(){
				var query3;
				while(ids.length){
					var current = ids.shift();
					query3 = client.query("select posts.*, login.username from posts, login where posts.userid = " + convertInSQLFormate(current.followerid) + "and login.id="+convertInSQLFormate(current.followerid), function(err, result){
						post = post.concat(result.rows);
					});
				}
				if(query3){
					query3.on('end',function(){
						if(ids.length == 0){
							res.end(JSON.stringify(post));
						}
					});
				}else res.end(JSON.stringify(post));
			})
		});
	}
});

app.post('/html/newPost', function(req, res, next){
	var cookie = req.cookies;
	if(cookie.id){
		var name = convertInSQLFormate(cookie.name);
		var id = convertInSQLFormate(cookie.id);
		var content = convertInSQLFormate(req.body.content);
		var query = client.query("insert into posts(userid, moment, content, likes) values("+id+",'"+moment().format("MM-DD-YYYY")+"',"+content+",0)", function(err){
			if(err){
				console.log(err)
				res.send(err.detail);
			};
		});
	}
});

app.get('/html/users',function(req, res, next){
	var query = client.query('select username from login', function(err, result){
		if(result.rows){
			result.rows.name = req.cookies.name;
			res.json(result.rows)
		};
	});
});

app.post('/html/logout', function(req, res){
	res.clearCookie('id');
	res.send({link:'index.html'});
});

app.post('/html/userSearch', function(req, res){
	var name = convertInSQLFormate(req.body.name);
	var query = client.query('select username, email, id from login where username='+name, function(err, result){
		res.json(result.rows);
	});
});

app.post('/html/likers', function(req, res, next){
	var postId = convertInSQLFormate(req.body.postId), likersId;
	var query = client.query('select likerid from likes where postid='+postId, function(err, result){
		likersId = result.rows;
	});
	query.on('end', function(){
		var data = [];
		while(likersId.length){
			var id = convertInSQLFormate(likersId.shift().likerid);
			var query2 = client.query('select username, email from login where id='+id, function(err, result){
				data.push(result.rows[0]);
			});
		}
		query2.on('end', function(){
			res.json(data);
		});
	});
});	

app.post('/html/like', function(req, res, next){
	var userId = convertInSQLFormate(req.cookies.id);
	var postId = convertInSQLFormate(req.body.postId);
	client.query('insert into likes values('+postId+','+userId+')', function(err){
		if(!err) client.query('update posts set likes=likes+1 where postid='+postId);
	});
});

app.post('/html/follow', function(req, res, next){
	var userid = convertInSQLFormate(req.body.userid), yourId = convertInSQLFormate(req.cookies.id);
	var query = client.query('insert into following values('+yourId+','+userid+')', function(err){
		if(err) res.send('You are already following this person');
	});
});

app.get('/html/name', function(req, res){
	res.send(req.cookies.name);
})

module.exports = app;