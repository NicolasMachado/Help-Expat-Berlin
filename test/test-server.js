const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const faker = require('faker');
const mongoose = require('mongoose');
const fs = require('fs');

const superAgent = require('superagent');
const agent = superAgent.agent();

const should = chai.should();
const {Request, User, Conversation, Rating} = require('../config/models');

chai.use(chaiHttp);
let testUser = {
	password: faker.name.lastName(),
	email: faker.internet.email(),
	_id: ''
}

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
  		this.timeout(5000);
		return closeServer();
	});
	
	describe('Root page', function() {
  		this.timeout(5000);
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
  		this.timeout(5000);
		it('should add a new user', function(done) {
			tearDownDb(); // TO MOVE !
			agent.post('http://127.0.0.1:8080/auth/new')
				.send({
					username: faker.internet.userName(),
					password: testUser.password,
					email: testUser.email
				})
	  			.end((err, res) => {
				    should.not.exist(err);
				    res.should.have.status(200);
					done();
	  			});
		});
	});
	
	describe('User log in', function() {
  		this.timeout(5000);
		it('should log in', function(done) {
			User.findOne()
				.then((user) => {
					testUser._id = user._id;
					agent.post('http://127.0.0.1:8080/auth/login')
						.send({
							password: testUser.password,
							email: testUser.email
				        })
			  			.end((err, res) => {
						    res.should.not.have.status(401);
						    should.not.exist(err);
						    res.should.have.status(200);
							done();
			  			});	
			  		})
		});
	});
	
	describe('Post a new request', function() {
  		this.timeout(5000);
		it('should add a new request', function(done) {
			agent.post('http://127.0.0.1:8080/request/new')
				.send({
		            author: testUser._id,
		            datePosted: new Date(),
		            dateevent: faker.date.future(),
		            title: faker.lorem.sentence(),
		            type: 'On Site Assistance',
		            location: 'Mitte',
		            price: faker.random.number(),
		            rate: 'flat',
		            description: faker.lorem.sentences(),
		            status: `open`,
		            interested: []
		        })
	  			.end((err, res) => {
				    should.not.exist(err);
				    res.should.redirectTo('http://127.0.0.1:8080/');
				    res.should.not.redirectTo('http://127.0.0.1:8080/auth/account-login');
				    res.should.have.status(200);
					done();
	  			});	
		});
	});

});