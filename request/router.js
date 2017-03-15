const express = require('express');
const passport = require('passport');
const {Request} = require('./models');
const router = express.Router();
router.use(express.static('./views'));

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
                authorID: req.user.id,
                datePosted: new Date(),
                dateEvent: req.body.dateevent,
                time: req.body.time,
                type: req.body.type,
                price: req.body.price,
                rate: req.body.rate,
                description: req.body.description,
                status: `open`,
                interested: []
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
