const express = require('express');
const passport = require('passport');
const {Request, User} = require('../config/models');
const router = express.Router();
router.use(express.static('./views'));

// SHOW ALL
router.get('/', (req, res) => {
    return Request
        .find()
        .populate('author')
        .then(reqs => res.json(
            reqs.map(req => req)
            ))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// NEW REQUEST SCREEN
router.get('/new', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('newrequest', {alertMessage: `Remember to read the rules before posting a new request.`});
    } else { 
        req.flash('errorMessage', 'You must login first.');
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
        req.flash('errorMessage', 'You must login first.');
        res.redirect('/');
    }
});

module.exports = {router};
