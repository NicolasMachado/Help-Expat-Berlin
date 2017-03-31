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

let user1 = {
	password: faker.name.lastName(),
	email: faker.internet.email(),
	id: '',
	iam: 'USER 1'
};
let user2 = {
	password: faker.name.lastName(),
	email: faker.internet.email(),
	id: '',
	iam: 'USER 2'
};
let testRequestID = '', testConvID = '';

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

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

function logOut () {
	describe('GET auth/logout', function() {
  		this.timeout(5000);
		it('should log out', function(done) {
			agent.get('http://127.0.0.1:8080/auth/logout')
			.end((err, res) => {
				should.not.exist(err);
				res.should.redirectTo('http://127.0.0.1:8080/');
				res.should.not.redirectTo('http://127.0.0.1:8080/auth/account-login');
				res.should.have.status(200);
				done();
			});	
		});
	});
}

function logIn (user) {
	describe('POST auth/login', function() {
  		this.timeout(5000);
		it('should log in user1', function(done) {
			agent.post('http://127.0.0.1:8080/auth/login')
				.send({
					password: user.password,
					email: user.email
		        })
				.end((err, res) => {
				    res.should.not.have.status(401);
				    should.not.exist(err);
				    res.should.have.status(200);
				    console.log('LOGGED IN AS ' + user.iam)
					done();
				});	
		});
	});
}

// MAIN TEST SUITE
describe('App API resource', function() {
	
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
	after(function() {
  		this.timeout(5000);
		return closeServer();
	});
	
	describe('GET /', function() {
  		this.timeout(5000);
		it('should return status 200', function(done) {
			tearDownDb(); // TO MOVE !
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
	
	describe('POST auth/new', function() {
  		this.timeout(5000);
		it('should add 2 new users', function(done) {
			agent.post('http://127.0.0.1:8080/auth/new')
				.send({
					username: faker.internet.userName(),
					password: user1.password,
					email: user1.email
				})
	  			.end((err, res) => {
				    should.not.exist(err);
				    res.should.have.status(200);
				    return agent.post('http://127.0.0.1:8080/auth/new')
						.send({
							username: faker.internet.userName(),
							password: user2.password,
							email: user2.email
						})
			  			.end((err, res) => {
						    should.not.exist(err);
						    res.should.have.status(200);
							return User.find()
								.then((users) => {
									user1.id = users[0]._id;
									user2.id = users[1]._id;
									done();
							  	})
			  			});
	  			});
		});
	});
	
	describe('POST auth/login', function() {
  		this.timeout(5000);
		it('should log in user1', function(done) {
			agent.post('http://127.0.0.1:8080/auth/login')
				.send({
					password: user1.password,
					email: user1.email
		        })
				.end((err, res) => {
				    res.should.not.have.status(401);
				    should.not.exist(err);
				    res.should.have.status(200);
					done();
				});	
		});
	});
	
	describe('POST request/new', function() {
  		this.timeout(5000);
		it('should post a new request', function(done) {
			agent.post('http://127.0.0.1:8080/request/new')
				.send({
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

	logOut();
	logIn(user2);
	
	describe('GET /proposehelp/:id', function() {
  		this.timeout(5000);
			it('should add user2 to interested array', function(done) {
				Request
					.findOne()
					.then((request) => {
						testRequestID = request._id;
							agent.get('http://127.0.0.1:8080/request/proposehelp/' + testRequestID)
					  			.end((err, res) => {
								    should.not.exist(err);
								    res.should.have.status(200);
									done();
					  			});	
					})
			});
	});
	
	describe('GET /revokehelp/:id', function() {
  		this.timeout(5000);
			it('should revoke user2 from interested array', function(done) {
				agent.get('http://127.0.0.1:8080/request/revokehelp/' + testRequestID)
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('GET /proposehelp/:id', function() {
  		this.timeout(5000);
			it('should add user2 to interested array again', function(done) {
				agent.get('http://127.0.0.1:8080/request/proposehelp/' + testRequestID)
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});

	logOut();
	logIn(user1);
	
	describe('GET /accepthelp/', function() {
  		this.timeout(5000);
			it('should accept help from user2', function(done) {
				agent.get('http://127.0.0.1:8080/request/accepthelp/')
					.query({
				        request : String(testRequestID),
				        helper : String(user2.id)
					})
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.body.should.be.an.Array;
					    res.body.should.not.be.empty;
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('POST auth/newmessage/:id', function() {
  		this.timeout(5000);
			it('should send a message to user2', function(done) {
				Conversation
					.findOne()
					.then((conv) => {
						testConvID = conv._id;
						agent.post('http://127.0.0.1:8080/auth/newmessage/' + testConvID)
							.send({
						        messageBody : faker.lorem.sentences(),
						        other: user2.id
							})
				  			.end((err, res) => {
							    should.not.exist(err);
							    res.body.should.be.an.Object;
							    res.body.should.not.be.empty;
							    res.should.have.status(200);
								done();
				  			});	
					})
			});
	});

	logOut();
	logIn(user2);
	
	describe('GET auth/get-profile-messages', function() {
  		this.timeout(5000);
			it('user2 checks his messages list', function(done) {
				agent.get('http://127.0.0.1:8080/auth/get-profile-messages/')
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.body.should.be.an.Object;
					    res.body.should.not.be.empty;
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('GET auth/get-conversation/:id', function() {
  		this.timeout(5000);
			it('user2 checks message from user1 and marks it as read', function(done) {
				agent.get('http://127.0.0.1:8080/auth/get-conversation/' + testConvID)
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.body.should.be.an.Object;
					    res.body.should.not.be.empty;
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('POST auth/newmessage/:id', function() {
  		this.timeout(5000);
			it('should send a message back to user1', function(done) {
				agent.post('http://127.0.0.1:8080/auth/newmessage/' + testConvID)
					.send({
				        messageBody : faker.lorem.sentences(),
				        other: user1.id
					})
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.body.should.be.an.Object;
					    res.body.should.not.be.empty;
					    res.should.have.status(200);
						done();
		  			});	
			});
	});

	logOut();
	logIn(user1);
	
	describe('GET auth/get-conversation/:id', function() {
  		this.timeout(5000);
			it('user1 checks response message from user2 and marks it as read', function(done) {
				agent.get('http://127.0.0.1:8080/auth/get-conversation/' + testConvID)
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.body.should.be.an.Object;
					    res.body.should.not.be.empty;
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('GET auth/get-profile-requests', function() {
  		this.timeout(5000);
			it('user1 checks his requests', function(done) {
				agent.get('http://127.0.0.1:8080/auth/get-profile-requests')
		  			.end((err, res) => {
					    res.body.should.be.an.Array;
					    res.body.should.not.be.empty;
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('GET auth/add-rating', function() {
  		this.timeout(5000);
			it('user1 rates user 2 and closes the query', function(done) {
				agent.get('http://127.0.0.1:8080/auth/add-rating')
					.query({
				        rating: Math.random()*5,
				        comment: faker.lorem.sentences(),
				        request: String(testRequestID),
				        user: String(user2.id),
				        iam: String(user1.id)
				    })
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});

	logOut();
	logIn(user2);
	
	describe('GET auth/get-profile-services', function() {
  		this.timeout(5000);
			it('user2 checks his services', function(done) {
				agent.get('http://127.0.0.1:8080/auth/get-profile-services')
		  			.end((err, res) => {
					    res.body.should.be.an.Array;
					    res.body.should.not.be.empty;
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('GET auth/add-rating', function() {
  		this.timeout(5000);
			it('user2 rates user 1 back', function(done) {
				agent.get('http://127.0.0.1:8080/auth/add-rating')
					.query({
				        rating: Math.random()*5,
				        comment: faker.lorem.sentences(),
				        request: String(testRequestID),
				        user: String(user1.id),
				        iam: String(user2.id)
				    })
		  			.end((err, res) => {
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('GET PROFILE sections', function() {
  		this.timeout(5000);
		it('should visit own profile', function(done) {
			agent.get('http://127.0.0.1:8080/auth/profile/' + user1.id)
	  			.end((err, res) => {
				    should.not.exist(err);
				    res.should.have.status(200);
					done();
	  			});			
		});

		it('should return user2 ratings', function(done) {
			agent.get('http://127.0.0.1:8080/auth/get-user-ratings/')
	  			.end((err, res) => {
				    should.not.exist(err);
				    res.should.have.status(200);
					    res.body.should.be.an.Array;
					    res.body.should.not.be.empty;
					done();
	  			});			
		});

		it('should return user1 ratings', function(done) {
			agent.get('http://127.0.0.1:8080/auth/get-other-ratings/' + user1.id)
	  			.end((err, res) => {
				    should.not.exist(err);
				    res.should.have.status(200);
				    res.body.should.be.an.Array;
				    res.body.should.not.be.empty;
					done();
	  			});			
		});
	});

	logOut();
	logIn(user1);
	
	describe('GET request/remove/:id', function() {
  		this.timeout(5000);
		it('should delete a request', function(done) {
			Request
				.findOne(testRequestID)
				.then((request) =>{
					agent.get('http://127.0.0.1:8080/request/remove/' + request.id)
			  			.end((err, res) => {
						    should.not.exist(err);
						    res.should.redirectTo('http://127.0.0.1:8080/auth/profile/' + user1.id + '?tab=requests');
						    res.should.not.redirectTo('http://127.0.0.1:8080/auth/account-login');
						    res.should.have.status(200);
							done();
			  			});						
				})
		});
	});
	
	describe('GET auth/get-user', function() {
  		this.timeout(5000);
			it('endpoint returns current logged in user (user1)', function(done) {
				agent.get('http://127.0.0.1:8080/auth/get-user')
		  			.end((err, res) => {
		  				res.body.should.be.an.Object;
		  				res.body.should.not.be.empty;
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	logOut();
	
	describe('GET auth/get-user', function() {
  		this.timeout(5000);
			it('endpoint returns current logged in user (null)', function(done) {
				agent.get('http://127.0.0.1:8080/auth/get-user')
		  			.end((err, res) => {
		  				res.body.should.be.an.Object;
		  				res.body.should.be.empty;
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});
	
	describe('GET auth/account-login-request', function() {
  		this.timeout(5000);
			it('should redirect to login', function(done) {
				agent.get('http://127.0.0.1:8080/auth/account-login-request')
		  			.end((err, res) => {
		  				res.should.redirectTo('http://127.0.0.1:8080/auth/account-login');
					    should.not.exist(err);
					    res.should.have.status(200);
						done();
		  			});	
			});
	});

});