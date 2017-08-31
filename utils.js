const {User} = require('./config/models');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Load either local config or regular config
if (fs.existsSync('./config/local')) {
    loadConfig('./config/local/config.js');
} else {
    loadConfig('./config/config.js');
}
function loadConfig (configPath) {
    return {MAIL_PASS, FACEBOOKAUTH} = require(configPath);
}

//Setting up mailer
const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    auth: {
        user: 'postmaster@sandbox82e9d6dc6f374890b03994540b9c6366.mailgun.org',
        pass: MAIL_PASS
    }
});

const sendMailAdmin = (message) => {
    let mailOptions = {
        from: 'nicoma63@gmail.com',
        to: 'nicoma63@gmail.com',
        subject: 'Mail from HEB backend',
        html: message
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

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

module.exports = {ensureLoginAjax, ensureLoginNormal, checkLogin, saveFilters, sendMailAdmin};
