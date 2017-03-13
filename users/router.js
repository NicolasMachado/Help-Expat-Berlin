const express = require('express');
const passport = require('passport');const LocalStrategy = require('passport-local').Strategy;

const {User} = require('./models');

const router = express.Router();

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

// CREATE NEW USER
router.post('/new', (req, res) => {
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }

    if (!('username' in req.body)) {
        return res.status(422).json({message: 'Missing field: username'});
    }

    let {username, password, firstName, lastName} = req.body;

    if (typeof username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }

    username = username.trim();

    if (username === '') {
        return res.status(422).json({message: 'Incorrect field length: username'});
    }

    if (!(password)) {
        return res.status(422).json({message: 'Missing field: password'});
    }

    if (typeof password !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: password'});
    }

    password = password.trim();

    if (password === '') {
        return res.status(422).json({message: 'Incorrect field length: password'});
    }

    // check for existing user
    return User
    .find({username})
    .count()
    .exec()
    .then(count => {
        if (count > 0) {
            return res.status(422).json({message: 'username already taken'});
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
        return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
        res.status(500).json({message: 'Internal server error'})
    });
});

// SHOW ALL USERS (to be removed eventually)
router.get('/', (req, res) => {
    /*return User
    .find()
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));*/
    res.render('views/index')
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
router.get('/profile/:username', (req, res, next) => {
    if (req.isAuthenticated()) {
        User.findOne({ username: req.params.username }, (err, user) => {
            res.send(user);
        });
    } else { 
        res.redirect('./');
    }
});

// LOG OUT
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


module.exports = {router};
