const express = require('express')
const user = require('./api/user.js');
const users = require('./api/users.js');
const auth = require('./api/auth.js');
const qr = require('./api/qr.js');
const question = require('./api/question.js');
const questions = require('./api/questions.js');

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
    
    router.post('/qr', passport.authenticate('jwt', {session: false}), qr.postNewQrCode);
    router.get('/qr/:type/:id', passport.authenticate('jwt', {session: false}), qr.getQRByObjectIdAndType);
    router.get('/qr/:id', passport.authenticate('jwt', {session: false}), qr.getQRByID);

    router.post('/question', passport.authenticate('jwt', {session: false}), question.postQuestion);
    router.patch('/question/:id', passport.authenticate('jwt', {session: false}), question.patchQuestion);
    router.get('/question/:id', passport.authenticate('jwt', {session: false}), question.getQuestion);

    router.get('/questions', passport.authenticate('jwt', {session: false}), questions.getQuestions);

    router.post('/login', auth.post_login);

    //There are some /api routes in socket.js
    
    app.use('/api', router);
}