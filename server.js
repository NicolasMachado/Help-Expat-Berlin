const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser')('keyboard cat');
const jsonParser = require('body-parser').json();
const urlEncoded = require('body-parser').urlencoded({ extended: true });
const session = (require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
const mongoose = require('mongoose');
const morgan = require('morgan');

const {router: usersRouter} = require('./users');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config/db');

const app = express();

const checkLogin = (req, res, next) => {
    req.user ? res.locals.user = req.user : res.locals.user = false;   
    req.error ? res.locals.error = req.error : res.locals.error = false;    
    next();
};

app.use(morgan('common'));
app.use(cookieParser);
app.use(jsonParser);
app.use(urlEncoded);
app.use(session);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('views'));

app.use('*', checkLogin);

app.use('/users/', usersRouter);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {user: req.user || null});
});

app.use('*', (req, res) => {
    return res.status(404).json({message: 'Not Found'});
});

// referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

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

