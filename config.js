exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/help-expat-berlin';
exports.PORT = process.env.PORT || 8080;