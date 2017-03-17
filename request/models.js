const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {User} = require('../auth/models');

mongoose.Promise = global.Promise;

const RequestSchema = mongoose.Schema({
    authorID: { type: String, required: true },
    datePosted: { type: Date, required: true },
    dateEvent: { type: Date, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    rate: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    interested: { type: Array }
});

function appendUserTo(result) {
	User
		.findById(result.authorID)
		.then(user => {
			result.author = user;
			console.log(user.username)
		});
}

// How requests should appear when listed
RequestSchema.methods.reprList = function () {
    result = {
        description: this.description || '',
        authorID : this.authorID || '',
        author: '' || 'Unknown'
    };
    appendUserTo(result);
    return result;
}

const Request = mongoose.model('Request', RequestSchema);

module.exports = {Request}; 