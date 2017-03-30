const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const faker = require('faker');
const mongoose = require('mongoose');
const fs = require('fs');

const should = chai.should();
const {Request, User, Conversation, Rating} = require('../config/models');

chai.use(chaiHttp);

// Load either local config or regular config
if (fs.existsSync('./config/local')) {
    console.log('Loading LOCAL config for testing');
    loadConfig('../config/local/config.js');
} else {
    console.log('Loading REMOTE config for testing');
    loadConfig('../config/config.js');
}
function loadConfig (configPath) {
    return {TEST_DATABASE_URL} = require(configPath);
}

function seedUserData() {
	console.info('seeding user data');
	const seedData = [];
	for (let i=1; i<=10; i++) {
		seedData.push(generateUserData());
	}
	return User.insertMany(seedData);
}

function generateUserData() {
	return {
		username: faker.internet.userName(),
		password: faker.name.lastName(),
		email: faker.internet.email(),
		authType: "normal",
		rating: faker.random.number(),
    	unreadMessages: faker.random.number(),
		nbRatings: faker.random.number()
	}
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('App API resource', function() {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
/*
	beforeEach(function() {
		return seedUserData();
	});

	afterEach(function() {
		return tearDownDb();
	});*/

	after(function() {
		return closeServer();
	});
	
	describe('Root page', function() {
		it('should return status 200', function(done) {
			chai.request(app)
			.get('/')
			.end(function(err, res) {
				should.not.exist(err);
				res.should.have.status(200);
				res.should.be.html;
				done();
			});
		});
	});
	
	describe('Create new user', function() {
		it('should add a new user', function(done) {
			chai.request(app)
				.post('/auth/new')
				.send({
					username: faker.internet.userName(),
					password: faker.name.lastName(),
					email: faker.internet.email()
				})
	  			.end((err, res) => {
				    should.not.exist(err);
				    res.should.have.status(200);
					done();
	  			});
		});
	});
	
	describe('Post a new request', function() {
		it('should add a new request', function(done) {
			User
				.findOne({}, {}, { sort: { 'username' : 1 } })
				.then((user) => {
					console.log(user);
					chai.request('http://127.0.0.1:8080')
						.post('/request/new')
						.auth('test@test.com', 'test')
						.send({
				            author: user._id,
				            datePosted: new Date(),
				            dateEvent: faker.date.future(),
				            title: faker.lorem.sentence,
				            time: '19:30',
				            type: 'On Site Assistance',
				            location: 'Mitte',
				            price: faker.random.number,
				            rate: 'flat',
				            description: faker.lorem.sentences,
				            status: `open`,
				            interested: []
				        })
			  			.end((err, res) => {
						    should.not.exist(err);
						    res.should.not.redirectTo('http://127.0.0.1:' + 8080 + '/auth/account-login-request');
						    res.should.have.status(200);
							done();
			  			});					
				})
		});
	});

});