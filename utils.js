const checkLogin = (req, res, next) => {
    res.locals.user = req.user || false; // check if authenticated
    const alertMessage = req.flash('alertMessage');
    const errorMessage = req.flash('errorMessage');
    alertMessage.length > 0 ? res.locals.alertMessage = alertMessage : res.locals.alertMessage = false;
    errorMessage.length > 0 ? res.locals.errorMessage = errorMessage : res.locals.errorMessage = false;
    next();
};

const ensureLoginAjax = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({message: 'You need to login first'});
    } 
}

const ensureLoginNormal = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/auth/account-login-request');
    } 
}

module.exports = {ensureLoginAjax, ensureLoginNormal, checkLogin};