const {User} = require('./config/models');

const checkLogin = (req, res, next) => {
    res.locals.user = req.user || false; // check if authenticated
    const alertMessage = req.flash('alertMessage');
    const errorMessage = req.flash('errorMessage');
    if (alertMessage.length > 0) {
        res.locals.alertMessage = alertMessage;
    } else {
        res.locals.alertMessage = false;
    }
    if (errorMessage.length > 0) {
        res.locals.errorMessage = errorMessage;
    } else {
        res.locals.errorMessage = false;
    }
    next();
};

const ensureLoginAjax = (req, res, next) => {
    if (req.isAuthenticated() && !req.user.banned) {
        next();
    } else {
        req.logout();
        res.status(401).json({message: 'You need to login first'});
    } 
};

const ensureLoginNormal = (req, res, next) => {
    if (req.isAuthenticated() && !req.user.banned) {
        next();
    } else {
        res.redirect('/auth/account-login-request');
    } 
};

const saveFilters = (req, res, next) => {
    let filters = { sort: {}, filter: {
        status: {$nin: ['deleted', 'closed']}
    }};
    filters.sort.datePosted = req.query.date;
    if (req.query.type !== 'Any') {
        filters.filter.type = req.query.type;
    }
    if (req.query.location !== 'Any') {
        filters.filter.location = req.query.location;
    }
    
    // paid
    if (req.query.paid === 'paid') {
        filters.filter.price = { $gt: 0 };
    } else if (req.query.paid === 'free') {
        filters.filter.price = { $eq: null };
    }

    if (req.isAuthenticated()) {
        return User
        .findByIdAndUpdate(req.user._id, { 
            myfilters: { 
                sort: {
                    datePosted: req.query.date
                }, 
                filter: {
                    price: req.query.paid,
                    type: req.query.type,
                    location: req.query.location
                } 
            }
        })
        .then(() => {
            req.filters = filters;
            next();
        })
        .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
    } else {
        req.filters = filters;
        next();
    }
};

module.exports = {ensureLoginAjax, ensureLoginNormal, checkLogin, saveFilters};