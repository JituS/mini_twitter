var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var routes = require('../lib/routes.js');
var sinon = require('sinon');

describe('routes',function(){
	describe('get /',function(){
		it('gives profile page if user is already logged in',function(done){
			request(routes)
				.get('/')
				.expect(200)
				.set("Cookie",'name='+"\'"+'jitendra'+"\'"+';id='+"\'"+'pnrohrcinsqld'+"\'")
				.expect(/Welcome to mini twitter/,done);
		});
	});
	describe('get /',function(){
		it('gives login/signup page if user is not logged in',function(done){
			request(routes)
				.get('/')
				.expect(200)
				.expect(/[input]*[signup]/,done);
		});
	});
	describe('get /login',function(){
		it('gives user profile if user is exist in database',function(done){
			request(routes)
				.post('/login')
				.send('name=jitendra&password=123')
				.expect(200)
				.expect(/html\/main.html/,done);
		});
	});
});