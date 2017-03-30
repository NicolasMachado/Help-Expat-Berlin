const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();
const {TEST_DATABASE_URL} = require('../config/local/config');
const {Request, User, Conversation, Rating} = require('../config/models');

chai.use(chaiHttp);

// Load either local config or regular config
if (fs.existsSync('../config/local')) {
    console.log('Loading local config');
    loadConfig('../config/local/config.js');
} else {
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

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
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

describe('App API resource', function() {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedUserData();
	});

	/*afterEach(function() {
		return tearDownDb();
	});*/

	after(function() {
		return closeServer();
	});
	
	describe('root page', function() {
		it('should return status 200', function(done) {
			chai.request(app)
			.get('/')
			.end(function(err, res) {
				res.should.have.status(200);
				res.should.be.html;
				done();
			});
		});
	});
});