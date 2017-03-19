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
        req.flash('errorMessage', 'You must log in first.');
        res.redirect('/');
    }
});

// SHOW ALL
router.get('/', (req, res) => {
    return Request
        .find()
        .populate('author')
        .then(reqs => res.json({results: reqs, user: req.user}))
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
            .find({ interested : req.user._id})
            .update({$push : {interested : req.user._id}})
            .then(() => res.json({alertMessage: `Update successful`}))
            .catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'})
            });
    } else { 
        req.flash('errorMessage', 'You must log in first.');
        res.redirect('/');
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
        req.flash('errorMessage', 'You must log in first.');
        res.redirect('/');
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
        req.flash('errorMessage', 'You must log in first.');
        res.redirect('/');
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
        req.flash('errorMessage', 'You must log in first.');
        res.redirect('/');
    }
});

module.exports = {router};
