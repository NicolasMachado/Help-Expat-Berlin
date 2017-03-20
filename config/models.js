const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// USER SCHEMA
const UserSchema = mongoose.Schema({
    username: { type: String, required: true },
    authType: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rating: { type: Number },
    facebook: {
        id: {type: String},
        token: {type: String}
    }
});

UserSchema.methods.apiRepr = function() {
    return {
        username: this.username || '',
        email: this.email || '',
        password: this.password || '',
        id: this._id,
        FBId: this.facebook.id || '',
        FBToken: this.facebook.token || '',
        authType: this.authType || '',
        rating: this.rating || ''
    };
}

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
}

// REQUEST SCHEMA
const RequestSchema = mongoose.Schema({
    title: { type: String, required: true },
    datePosted: { type: Date, required: true },
    dateEvent: { type: Date },
    type: { type: String, required: true },
    price: { type: Number },
    rate: { type: String },
    description: { type: String, required: true },
    status: { type: String, required: true },
    interested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const User = mongoose.model('User', UserSchema);
const Request = mongoose.model('Request', RequestSchema);

module.exports = {Request, User}; 