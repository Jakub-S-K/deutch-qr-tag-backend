const express = require('express')
const user = require('./api/user.js');
const users = require('./api/users.js');
const auth = require('./api/auth.js');
var passport = require('passport');

module.exports = function (app) {

    app.use(passport.initialize());

    const router = express.Router();
    
    router.get('/user/:id', passport.authenticate('jwt', {session: false}), user.get);
    router.post('/user', passport.authenticate('jwt', {session: false}), user.post);
    router.delete('/user/:id', passport.authenticate('jwt', {session: false}), user.delete);
    router.patch('/user/:id', passport.authenticate('jwt', {session: false}), user.patch);

    router.get('/users', passport.authenticate('jwt', {session: false}), users.get);

    router.get('/access_test', passport.authenticate('jwt', {session: false}), auth.get_access_test);
    router.post('/login', auth.post_login);
    
    
    app.use('/api', router);
}