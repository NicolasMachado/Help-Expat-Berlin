const express = require('express');
const passport = require('passport');const LocalStrategy = require('passport-local').Strategy;
const {User} = require('./models');
const router = express.Router();
router.use(express.static('./views'));

// DEFINE AUTH STRATEGY
const localStrategy = new LocalStrategy({
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
});

passport.use(localStrategy);

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
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});

// CREATE NEW USER
router.post('/new', (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }

    if (!('username' in req.body)) {
        return res.render('account-create', {error: 'Missing field: username'});
    }

    let {username, password, firstName, lastName} = req.body;

    if (typeof username !== 'string') {
        return res.render('account-create', {error: 'Incorrect field type: username'});
    }

    username = username.trim();

    if (username === '') {
        return res.render('account-create', {error: 'You must provide a user name'});
    }

    if (!(password)) {
        return res.render('account-create', {error: 'You must provide a password'});
    }

    if (typeof password !== 'string') {
        return res.render('account-create', {error: 'Incorrect field type: password'});
    }

    password = password.trim();

    if (password === '') {
        return res.render('account-create', {error: 'You must provide a password'});
    }

    // check for existing user
    return User
    .find({username})
    .count()
    .exec()
    .then(count => {
        if (count > 0) {
            return res.render('account-create', {error: 'Username already taken'});
        }
    // if no existing user, hash password
    return User.hashPassword(password)
    })
    .then(hash => {
        return User
        .create({
            username: username,
            password: hash,
            firstName: firstName,
            lastName: lastName
        })
    })
    .then(user => {
        res.redirect('./'); // account created
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

// LOG OUT
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


module.exports = {router};
