const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser')('whatever floats your boat');
const jsonParser = require('body-parser').json();
const urlEncoded = require('body-parser').urlencoded({ extended: true });
const session = (require('express-session')({ secret: 'whatever floats your boat', resave: false, saveUninitialized: false }));
const mongoose = require('mongoose');
const morgan = require('morgan');
const flash = require('connect-flash');
const fs = require('fs');
const {checkLogin} = require('./utils');

const {router: authRouter} = require('./auth');
const {router: requestRouter} = require('./request');

let server;

mongoose.Promise = global.Promise;

// Load either local config or regular config
if (fs.existsSync('./config/local')) {
    console.log('Loading local config');
    loadConfig('./config/local/config.js');
} else {
    loadConfig('./config/config.js');
}
function loadConfig (configPath) {
    return {PORT, DATABASE_URL} = require(configPath);
}

const app = express();
const io = require('socket.io')(app.listen(3000));

app.use(morgan('common'));
app.use(cookieParser);
app.use(jsonParser);
app.use(urlEncoded);
app.use(session);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('views'));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('*', checkLogin);

app.use('/auth/', authRouter);
app.use('/request/', requestRouter);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.use('*', (req, res) => { 
    return res.status(404).json({message: '404 - Not Found'});
});

function runServer() {
    return new Promise((resolve, reject) => {
        mongoose.connect(DATABASE_URL, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(PORT, () => {
                console.log(`Your app is listening on port ${PORT}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

