const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

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

const Request = mongoose.model('Request', RequestSchema);

module.exports = {Request};