const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const {User, Request} = require('../config/models');
const router = express.Router();
const faker = require('faker');
const {FACEBOOKAUTH} = require('../config/config.js');
router.use(express.static('./views'));

// DEFINE AUTH STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true
    },
    function(email, password, callback) {
        let user;
        User
        .findOne({ email: email })
        .then(_user => {
            user = _user;
            if (!user) {
                return callback(null, false, {message: 'Incorrect email'});
            }
            return user.validatePassword(password);
        })
        .then(isValid => {
            if (!isValid) {
                return callback(null, false, {message: 'Incorrect password'});
            }
            else {
                return callback(null, user)
            }
        });
}));

// DEFINE FACEBOOK STRATEGY
passport.use(new FacebookStrategy({
    clientID: FACEBOOKAUTH.clientID,
    clientSecret: FACEBOOKAUTH.clientSecret,
    callbackURL: FACEBOOKAUTH.callbackURL,
    profileFields: ["emails", "displayName"]
  },
  function(accessToken, refreshToken, profile, cb) {
    let user;
    User
    .findOne({ 'facebook.id': profile.id })
    .then(_user => {
        user = _user;
        if (!user) {
            return User
            .create({
                username: profile.displayName,
                authType: 'facebook',
                password: faker.internet.password(),
                email: profile.emails[0].value,
                facebook: {
                    id: profile.id,
                    token: accessToken
                }
            })
            .then(user => cb(null, user))
        } else {
            return cb(null, user);
        }
    });
}));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

// SHOW ALL USERS (to be removed eventually)
router.get('/showall', (req, res) => {
    return User
    .find()
    .populate('requests')
    .then(users => {res.render('userlist', {users})})
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});

// CREATE NEW USER
router.post('/new', (req, res) => {
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }

    if (!('username' in req.body)) {
        return res.render('account-create', {errorMessage: 'Missing field: username'});
    }

    if (!('email' in req.body)) {
        return res.render('account-create', {errorMessage: 'Missing field: email'});
    }

    let {username, password, email} = req.body;

    if (typeof username !== 'string') {
        return res.render('account-create', {errorMessage: 'Incorrect field type: username'});
    }

    username = username.trim();
    email = email.trim();
    password = password.trim();

    if (username === '') {
        return res.render('account-create', {errorMessage: 'You must provide a user name'});
    }

    if (email === '') {
        return res.render('account-create', {errorMessage: 'You must provide an email address'});
    }

    if (!(password)) {
        return res.render('account-create', {errorMessage: 'You must provide a password'});
    }

    if (typeof password !== 'string') {
        return res.render('account-create', {errorMessage: 'Incorrect field type: password'});
    }

    if (password === '') {
        return res.render('account-create', {errorMessage: 'You must provide a password'});
    }

    // check for existing user
    return User
    .find({email : email})
    .count()
    .then(count => {
        if (count > 0) {
            return res.render('account-create', {errorMessage: 'This email address is already registered'});
        }
    // if no existing user, hash password
    return User.hashPassword(password)
    })
    .then(hash => {
        return User
        .create({
            username: username,
            password: hash,
            email: email,
            authType: 'normal',
        })
    })
    .then(user => {
        req.flash('alertMessage', 'Account created! You can now log in with your credentials.');
        res.redirect('/'); // account created
    })
    .catch(err => {
        res.status(500).json({message: err.errmsg})
    });
});

// LOG IN
router.post('/login', passport.authenticate('local'), (req, res, next) => {
    if (req.isAuthenticated()) {
        User.findOne({ email: req.body.email }, (err, user) => {
            req.flash('alertMessage', `Welcome, ${user.username}`);
            res.redirect('profile/' + user._id);
        });
    } else { 
        req.flash('errorMessage', 'Couldn\'t login');
        res.redirect('/');
    } 
});

// PROFILE
router.get('/profile/:id', (req, res, next) => {
    if (req.isAuthenticated()) {
        User
            .findOne({ _id: req.params.id })
            .then(profileUser => {
                Request
                    .find({author : profileUser._id})
                    .then((requests) => {
                        res.locals.profileUser = profileUser;
                        res.locals.currentuser = req.user;
                        res.locals.requests = requests;
                        res.render('profile');
                    })
            })
    } else { 
        req.flash('errorMessage', 'You must be logged in to view profiles. Please log in first.');
        res.redirect('/');
    }
});

// CREATE ACCOUNT
router.get('/account-create', (req, res) => {
    res.render('account-create');
});

// DELETE
router.get('/delete/:id', (req, res) => {
    User
    .findByIdAndRemove(req.params.id)
    .then(() => {
        return Request
            .find({author : req.params.id})
            .remove()
    })
    .then(res.redirect('/auth/showall'))
});

// LOG OUT
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// LOGIN WITH FB
router.get('/facebook', passport.authenticate('facebook', { scope : ['email'] }));

// FB CALLBACK
router.get('/facebook/callback', passport.authenticate('facebook', { scope : ['email'] }), (req, res) => {
    if (req.isAuthenticated()) {
        req.flash('alertMessage', 'You are logged in with Facebook');
        res.redirect('/auth/profile/' + req.user.id);
    } else { 
        req.flash('errorMessage', 'Not authenticated!');
        res.redirect('/');
    }
});

module.exports = {router};
