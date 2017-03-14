const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const {User} = require('./models');
const router = express.Router();
router.use(express.static('./views'));

// DEFINE AUTH STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: true
    },
    function(username, password, callback) {
        let user;
        User
        .findOne({ username: username })
        .then(_user => {
            user = _user;
            if (!user) {
                return callback(null, false, {message: 'Incorrect username'});
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
    clientID: '858085050997039',
    clientSecret: '592abccfb6f6d9b974a0537086d1c067',
    callbackURL: "http://localhost:8080/auth/facebook/callback",
    profileFields: ["emails", "displayName"]
  },
  function(accessToken, refreshToken, profile, cb) {
    let user;
    console.log(`profile.id in strategy: ${profile.id}`);
    User
    .findOne({ facebook: {id: profile.id }})
    .then(_user => {
            user = _user;
            if (!user) {
                return User
                .create({
                    username: profile.displayName,
                    password: "fbnopass",
                    email: "test.example@test.com",
                    facebook: {
                        id: profile.id,
                        token: accessToken,
                        email: "test.example@test.com"
                    }
                })
            } else {
                return cb(null, user);
            }
        })
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
    console.log(user);
    return cb(null, user);
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
    .find({username})
    .count()
    .exec()
    .then(count => {
        if (count > 0) {
            return res.render('account-create', {errorMessage: 'Username already taken'});
        }
    // if no existing user, hash password
    return User.hashPassword(password)
    })
    .then(hash => {
        return User
        .create({
            username: username,
            password: hash,
            email: email
        })
    })
    .then(user => {
        req.flash('alertMessage', 'Account created!');
        res.redirect('/'); // account created
    })
    .catch(err => {
        res.status(500).json({message: 'Internal server error'})
    });
});

// LOG IN
router.post('/login', passport.authenticate('local'), (req, res, next) => {
    if (req.isAuthenticated()) {
        User.findOne({ username: req.body.username }, (err, user) => {
            res.redirect('/');      
        });
    } else { 
        res.send('Couldn\'t log in'); 
    }
});

// PROFILE
router.get('/profile/', (req, res, next) => {
    if (req.isAuthenticated()) {
        User.findOne({ username: req.user.username }, (err, user) => {
            res.render('profile', user);
        });
    } else { 
        res.redirect('./');
    }
});

// CREATE ACCOUNT
router.get('/account-create', (req, res) => {
    res.render('account-create');
});

// DELETE
router.get('/delete/:id', (req, res) => {
    console.log(req.params.id);
    User
    .findByIdAndRemove(req.params.id)
    .then(res.redirect('/auth/showall'))
});

// LOG OUT
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// LOGIN WITH FB
router.get('/facebook', passport.authenticate('facebook'));

// FB CALLBACK
router.get('/facebook/callback', (req, res, next) => {
    console.log("req.user after callback:");
    console.log(req.user);
    if (req.isAuthenticated()) {
            req.flash('alertMessage', 'You are connected with FB!');
            res.redirect('/');
    } else { 
        req.flash('errorMessage', 'Not authenticated!');
        res.redirect('/');
    }
});

module.exports = {router};
