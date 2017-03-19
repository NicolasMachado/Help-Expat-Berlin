exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL;

exports.PORT = process.env.PORT || 8080;

exports.FACEBOOKAUTH = {
        'clientID'      : process.env.FB_CLIENT_ID, // your App ID
        'clientSecret'  : process.env.FB_CLIENT_SECRET, // your App Secret
        'callbackURL'   : process.env.FB_CALLBACK_URL
    }; 