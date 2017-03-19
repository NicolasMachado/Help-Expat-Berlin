const express = require('express');
const passport = require('passport');
const {Request, User} = require('../config/models');
const router = express.Router();
router.use(express.static('./views'));

// NEW REQUEST SCREEN
router.get('/new', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('newrequest', {alertMessage: `Remember to read the rules before posting a new request.`});
    } else { 
        res.redirect('/auth/account-login-request');
    }
});

// SHOW ALL
router.get('/', (req, res) => {
    return Request
        .find()
        .sort({datePosted: -1})
        .populate('author')
        .then(reqs => res.json({results: reqs, user: req.user}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// UPDATE REQUEST DISPLAY
router.get('/update-display/:id', (req, res) => {
    return Request
        .findById(req.params.id)
        .populate('author')
        .then(request => res.json({result: request, user: req.user}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// PROPOSE HELP
router.get('/proposehelp/:id', (req, res) => {
    if (req.isAuthenticated()) {
        return Request
            .findById(req.params.id)
            .find({ interested : {$nin: [req.user._id]}})
            .update({$push : {interested : req.user._id}})
            .then(() => res.json({alertMessage: `Update successful`}))
            .catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'})
            });
    } else { 
        res.status(401).json({message: 'You need to login first'});
    }
});

// REVOKE HELP
router.get('/revokehelp/:id', (req, res) => {
    if (req.isAuthenticated()) {
        return Request
            .findById(req.params.id)
            .find({ interested : {$in: [req.user._id]}})
            .update({$pull : {interested : req.user._id}})
            .then(() => res.json({alertMessage: `Update successful`}))
            .catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'})
            });
    } else { 
        res.redirect('/auth/account-login-request');
    }
});

// DELETE REQUEST
router.get('/delete/:id', (req, res) => {
    if (req.isAuthenticated()) {
        return Request
            .findByIdAndUpdate(req.params.id, {status: `deleted`})
            .then(() => {
                req.flash('alertMessage', 'Your request has been deleted.');
                res.redirect('/');
            })
    } else { 
        res.redirect('/auth/account-login-request');
    }
});

// REMOVE REQUEST
router.get('/remove/:id', (req, res) => {
    if (req.isAuthenticated()) {
        return Request
            .findByIdAndRemove(req.params.id)
            .then(() => {
                req.flash('alertMessage', 'Your request has been deleted.');
                res.redirect('/auth/profile/' + req.user.id);
            })
    } else { 
        res.redirect('/auth/account-login-request');
    }
});

// POST NEW REQUEST
router.post('/new', (req, res) => {
    if (req.isAuthenticated()) {
        if (!req.body) {
            return res.status(400).json({message: 'No request body'});
        }

        if (!('description' in req.body)) {
            return res.render('newrequest', {errorMessage: 'Missing field: description'});
        }

        return Request
            .create({
                author: req.user.id,
                datePosted: new Date(),
                dateEvent: req.body.dateevent || null,
                time: req.body.time,
                type: req.body.type,
                price: req.body.price,
                rate: req.body.rate,
                description: req.body.description,
                status: `open`,
                interested: []
            })
            .then(request => {
                return User
                    .findByIdAndUpdate(request.author, {$push: {requests : request._id}})
            })
            .then(() => {
                req.flash('alertMessage', 'Your request has been posted!');
                res.redirect('/'); // account created
            })
            .catch(err => {
                res.status(500).json({message: err.errmsg})
            });
    } else { 
        res.redirect('/auth/account-login-request');
    }
});

module.exports = {router};
