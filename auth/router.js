const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const {User, Request, Conversation, Rating} = require('../config/models');
const router = express.Router();
const faker = require('faker');
const fs = require('fs');
const {ensureLoginAjax, ensureLoginNormal, sendMailAdmin} = require('../utils');

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
                return callback(null, user);
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
            .then(user => cb(null, user));
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

// CREATE NEW USER
router.post('/new', (req, res) => {
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }

    if (!('username' in req.body)) {
        return res.status(666).render('account-create', {errorMessage: 'Missing field: username'});
    }

    if (!('email' in req.body)) {
        return res.status(422).render('account-create', {errorMessage: 'Missing field: email'});
    }

    let {username, password, email} = req.body;

    if (typeof username !== 'string') {
        return res.status(422).render('account-create', {errorMessage: 'Incorrect field type: username'});
    }

    username = username.trim();
    email = email.trim();
    password = password.trim();

    if (username === '') {
        return res.status(422).render('account-create', {errorMessage: 'You must provide a user name'});
    }

    if (email === '') {
        return res.status(422).render('account-create', {errorMessage: 'You must provide an email address'});
    }

    if (!(password)) {
        return res.status(422).render('account-create', {errorMessage: 'You must provide a password'});
    }

    if (typeof password !== 'string') {
        return res.status(422).render('account-create', {errorMessage: 'Incorrect field type: password'});
    }

    if (password === '') {
        return res.status(422).render('account-create', {errorMessage: 'You must provide a password'});
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
    return User.hashPassword(password);
    })
    .then(hash => {
        return User
        .create({
            username: username,
            password: hash,
            email: email,
            authType: 'normal',
        });
    })
    .then(user => {
        sendMailAdmin('<h2>Someone has created a new HEB account!</h2>');
        req.flash('alertMessage', 'Account created! You can now log in with your credentials.');
        res.redirect('/'); // account created
    })
    .catch(err => {
        res.status(500).json({message: err.errmsg});
    });
});

// POST NEW MESSAGE
router.post('/newmessage/:id', ensureLoginAjax, (req, res) => {
    return Conversation
        .findById(req.params.id)
        .update({$push : {
            messages : {
                date: new Date (),
                from: req.user._id,
                body: req.body.messageBody
            }
        }, $set: {
            dateLast: new Date (),
            unreadUser: req.body.other
        }, $inc: {
            nbUnread: 1
        }})
        .then(() => {
            return User
                .findByIdAndUpdate(req.body.other, {$inc: { unreadMessages: 1 }})
                .then((result) => {
                    io.to(String(req.body.other)).emit('newMessage', {userID: req.user._id, convID: req.params.id, otherID: req.body.other});
                    io.to(String(req.user._id)).emit('newMessage', {userID: req.user._id, convID: req.params.id, otherID: req.body.other});
                    res.send({conversation: req.params.id, user: req.user});
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

// AJAX SAVE NEW RATING FROM AUTHOR
router.get('/add-rating', ensureLoginAjax, (req, res) => {
    const helper = req.query.iam === 'author' ? req.query.user : null;
    let avgRating, nbRatings, sumRatings;
    // checking if rating already exists
    return Rating
        .findOne({
            user: req.query.user,
            request: req.query.request,
            from: req.user._id
        })
        .then((rating) => {
            if (rating) {
                throw new Error('RATING ALREADY EXISTS, IGNORING');
            }
        })
        .then(() => {
            return Rating
                .create({
                    rating: req.query.rating,
                    comment: req.query.comment,
                    user: req.query.user,
                    request: req.query.request,
                    from: req.user._id
                });
            })
        .then(() => {
            return Rating
                .find({user: req.query.user})
                .then((ratings) => {
                    const allRatings = ratings.map((rating) => {
                        return rating.rating;
                    });
                    nbRatings = allRatings.length;
                    sumRatings = allRatings.reduce((a, b) => { return a + b; }, 0);
                    avgRating = (sumRatings/nbRatings).toFixed(2);
                });
        })
        .then(() => {
            return User
                .findByIdAndUpdate(req.query.user, { rating: avgRating, nbRatings: nbRatings });
        })
        .then(() => {
            return Request
                .findByIdAndUpdate(req.query.request, { status: 'closed', helper: helper });
        })
        .then(() => {
            res.status(200).send('Success');
        })
        .catch(err => {
            req.flash('errorMessage', 'There was an error processing your rating');
            res.status(500).redirect('/auth/profile/' + req.user._id + '?tab=profile');
        });
});

// AJAX RETURN USER RATINGS
router.get('/get-user-ratings', ensureLoginAjax, (req, res) => {
    return Rating
        .find({ user : req.user._id })
        .populate('from')
        .populate('request')
        .sort({date: -1})
        .then(ratings => res.send(ratings))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

// AJAX RETURN OTHER RATINGS
router.get('/get-other-ratings/:id', ensureLoginAjax, (req, res) => {
    return Rating
        .find({ user : req.params.id })
        .populate('from')
        .populate('request')
        .sort({date: -1})
        .then(ratings => res.send(ratings))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

// AJAX RETURN INDIVIDUAL CONVERSATION
router.get('/get-conversation/:id', ensureLoginAjax, (req, res) => {
    let currentConv = '', oldUnread = 0;
    Conversation
        .findById(req.params.id)
        .populate('users')
        .populate('messages.from')
        .then(conv => currentConv = conv)
        // get number of unread messages
        .then(() => {
            return Conversation
                .findById(currentConv._id)
                .then((conv) => {
                    oldUnread = conv.nbUnread;
                    if (currentConv.unreadUser === String(req.user._id)) {
                        return User
                            .findByIdAndUpdate(req.user._id, {$inc: {unreadMessages: -conv.nbUnread}})
                            .then((user) => {
                                return User
                                    .findById(req.user._id)
                                    .then(user => {
                                        if (user.unreadMessages < 0) {
                                            return User
                                                .findByIdAndUpdate(req.user._id, {unreadMessages: 0});
                                        }
                                    });
                            });
                    }
                });
        })
        // set unread to 0 in conversation
        .then(() => {
            if (currentConv.unreadUser === String(req.user._id)) {
                return Conversation
                    .findByIdAndUpdate(currentConv._id, {$set: {unreadUser: '', nbUnread: 0}});// mark as read
                }
        })
        .then(() => res.send({conversation: currentConv, user: req.user, oldUnread: oldUnread}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

// AJAX RETURN PROFILE CONVERSATIONS
router.get('/get-profile-messages', ensureLoginAjax, (req, res) => {
    Conversation
        .find({users: {$in: [req.user._id]}})
        .sort({dateLast: -1})
        .populate('users')
        .then(reqs => res.send({conversations: reqs, user: req.user}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

// AJAX RETURN PROFILE REQUESTS
router.get('/get-profile-requests', ensureLoginAjax, (req, res, next) => {
    Request
        .find({author : req.user.id})
        .populate('interested')
        .then(requests => {
            res.json(requests);
        });
});

// AJAX RETURN PROFILE SERVICES
router.get('/get-profile-services', ensureLoginAjax, (req, res, next) => {
    Request
        .find({interested: req.user._id})
        .populate('author')
        .then(requests => {
            res.json({requests: requests, currentUser: req.user});
        });
});

// AJAX RETURN CURRENT USER
router.get('/get-current-user', ensureLoginAjax, (req, res, next) => {
    User.findById(req.user.id)
        .then(user => {
            res.json(user);
        });
});

// AJAX RETURN CURRENT USER EVEN IF DISCONNECTED
router.get('/get-user', (req, res, next) => {
    if (req.user) {
        User.findById(req.user.id)
            .then(user => {
                res.json({user: user});
            });
    } else {
        res.json({user: null});
    }
});

// PROFILE
router.get('/profile/:id', ensureLoginNormal, (req, res, next) => {
    let profile = {user: {}, requests: {}, services: {}, currentUser: req.user};
    User
        .findOne({ _id: req.params.id })
        .then(profileUser => {
            profile.user = profileUser;
            Request
                .find({author : profileUser._id})
                .populate('interested')
                .then((requests) => {
                    profile.requests = requests;
                        Request
                        .find({interested: req.user._id})
                        .then((requests) => {
                            profile.services = requests;
                            res.render('profile', {profile});
                        });
                });
        });
});

// CREATE ACCOUNT PAGE
router.get('/account-create', (req, res) => {
    res.render('account-create');
});

// LOGIN ACCOUNT PAGE
router.get('/account-login', (req, res) => {
    res.render('account-login');
});

// LOGIN ACCOUNT PAGE WITH ALERT MESSAGE
router.get('/account-login-request', (req, res) => {
    req.flash('errorMessage', 'Please log in first.');
    res.redirect('/auth/account-login');
});

// LOG IN
router.post('/login', passport.authenticate('local'), ensureLoginNormal, (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        req.flash('alertMessage', `Welcome, ${user.username}`);
        res.redirect('/auth/profile/' + user._id + '?tab=profile');
    });
});

// LOG OUT
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('alertMessage', 'You are now logged out.');
    res.redirect('/');
});

// LOGIN WITH FB
router.get('/facebook', passport.authenticate('facebook', { scope : ['email'] }));

// FB CALLBACK
router.get('/facebook/callback', passport.authenticate('facebook', { scope : ['email'] }), ensureLoginNormal, (req, res) => {
    req.flash('alertMessage', 'Welcome, ' + req.user.username);
    res.redirect('/auth/profile/' + req.user._id + '?tab=profile');
});

module.exports = {router};
