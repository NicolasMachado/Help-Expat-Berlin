exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       'mongodb://Nico:AlphaAndOmega@ds133338.mlab.com:33338/help-expat-berlin' ||
                      'mongodb://localhost/help-expat-berlin';

exports.PORT = process.env.PORT || 8080;

exports.FACEBOOKAUTH = {
        'clientID'      : global.FB_CLIENT_ID || '858085050997039', // your App ID
        'clientSecret'  : global.FB_CLIENT_SECRET || '592abccfb6f6d9b974a0537086d1c067', // your App Secret
        'callbackURL'   : global.FB_CALLBACK_URL || 'http://localhost:8080/auth/facebook/callback'
    };