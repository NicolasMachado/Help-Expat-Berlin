const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    facebook: {
        id: {type: String},
        token: {type: String},
        email: {type: String}
    }
});

UserSchema.methods.apiRepr = function() {
    return {
        username: this.username || '',
        email: this.email || '',
        password: this.password || '',
        id: this._id,
        FBId: this.facebook.id || ''
    };
}

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};