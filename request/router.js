const express = require('express');
const passport = require('passport');
const {Request, User, Conversation} = require('../config/models');
const router = express.Router();
const {ensureLoginAjax, ensureLoginNormal} = require('../utils');
router.use(express.static('./views'));

// NEW REQUEST SCREEN
router.get('/new', ensureLoginNormal, (req, res) => {
    res.render('newrequest', {alertMessage: `Remember to read the rules before posting a new request.`});
});

// AJAX SHOW ALL
router.get('/', (req, res) => {
    return Request
        .find()
        .sort({datePosted: -1})
        .populate('author')
        .then(reqs => res.send({results: reqs, user: req.user}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// AJAX ACCEPT HELP
router.get('/accepthelp', ensureLoginAjax, (req, res) => {
    let thisRequest;
    return Request
        .findById(req.query.request)
        .update({$push : {accepted : req.query.helper}})
        .then(() => {
            Conversation
                .findOne({$and: [{users: {$in: [req.user._id]}}, {users: {$in: [req.query.helper]}}] })
                .then(conv => {
                    if (!conv) {
                        console.log('conversation doesnt exist, creating one');
                        Conversation
                            .create({
                                users: [req.user._id, req.query.helper]
                            })
                    } else {
                        console.log('conversation already exists, updating dateLast');
                        return Conversation
                            .findByIdAndUpdate(conv._id, { dateLast: new Date() });
                    }
                })
        })
        .then(() => {
            Request
            .findById(req.query.request)
            .populate('interested')
            .then(request => res.send(request))
        });
});

// AJAX UPDATE REQUEST DISPLAY
router.get('/update-display/:id', ensureLoginAjax, (req, res) => {
    return Request
        .findById(req.params.id)
        .populate('author')
        .populate('accepted')
        .then(request => res.json({result: request, user: req.user}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// AJAX PROPOSE HELP
router.get('/proposehelp/:id', ensureLoginAjax, (req, res) => {
    return Request
        .findById(req.params.id)
        .find({ interested : {$nin: [req.user._id]}})
        .update({$push : {interested : req.user._id}})
        .then(() => res.json({alertMessage: `Update successful`}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// AJAX REVOKE HELP
router.get('/revokehelp/:id', ensureLoginAjax, (req, res) => {
    return Request
        .findById(req.params.id)
        .find({ interested : {$in: [req.user._id]}})
        .update({$pull : {interested : req.user._id}})
        .then(() => res.json({alertMessage: `Update successful`}))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// DELETE REQUEST
router.get('/delete/:id', ensureLoginNormal, (req, res) => {
    return Request
        .findByIdAndUpdate(req.params.id, {status: `deleted`})
        .then(() => {
            req.flash('alertMessage', 'Your request has been deleted.');
            res.redirect('/');
        })
});

// REMOVE REQUEST
router.get('/remove/:id', ensureLoginNormal, (req, res) => {
    return Request
        .findByIdAndRemove(req.params.id)
        .then(() => {
            req.flash('alertMessage', 'Your request has been deleted.');
            res.redirect('/auth/profile/' + req.user.id);
        })
});

// POST NEW REQUEST
router.post('/new', ensureLoginNormal, (req, res) => {
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
            title: req.body.title,
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
});

module.exports = {router};
