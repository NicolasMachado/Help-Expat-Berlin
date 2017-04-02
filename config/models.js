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
    nbRatings: { type: Number, default: 0 },
    unreadMessages: { type: Number, default: 0, min: 0 },
    facebook: {
        id: {type: String},
        token: {type: String}
    },
    myfilters: {
        sort: {
            datePosted: { type: Number }
        },
        filter: {
            price: { type: String },
            type: { type: String },
            location: { type: String }
        }
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
};

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

// REQUEST SCHEMA
const RequestSchema = mongoose.Schema({
    title: { type: String, required: true },
    datePosted: { type: Date, required: true },
    dateEvent: { type: Date },
    type: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number },
    rate: { type: String },
    description: { type: String, required: true },
    status: { type: String, required: true },
    interested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    accepted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    strict: 'throw'
});

// CONVERSATION SCHEMA
const ConversationSchema = mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    dateLast: { type: Date, default: Date.now },
    unreadUser: { type: String },
    nbUnread: { type: Number, default: 0 },
    messages: [{
        date: { type: Date },
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        body: { type: String }
    }]
});

// RATING SCHEMA
const RatingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, default: '' },
    date: { type: Date, default: Date.now, required: true  }
});

const User = mongoose.model('User', UserSchema);
const Request = mongoose.model('Request', RequestSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);
const Rating = mongoose.model('Rating', RatingSchema);

module.exports = {Request, User, Conversation, Rating}; 