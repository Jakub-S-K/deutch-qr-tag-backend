const express = require('express')
const user = require('./api/user.js');
const users = require('./api/users.js');
const auth = require('./api/auth.js');
const qr = require('./api/qr.js');
const question = require('./api/question.js');
const questions = require('./api/questions.js');
const options = require('./api/options.js');
const team = require('./api/team.js');
const teams = require('./api/teams.js');

var passport = require('passport');

module.exports = function (app) {

    app.use(passport.initialize());

    const router = express.Router();
    
    router.get('/user/:id', passport.authenticate('jwt', {session: false}), user.get);
    router.post('/user', passport.authenticate('jwt', {session: false}), user.post);
    router.delete('/user/:id', passport.authenticate('jwt', {session: false}), user.delete);
    router.patch('/user/:id', passport.authenticate('jwt', {session: false}), user.patch);

    router.get('/users', passport.authenticate('jwt', {session: false}), users.get);

    router.post('/qr', passport.authenticate('jwt', {session: false}), qr.postNewQrCode);
    router.get('/qr/:type/:id', passport.authenticate('jwt', {session: false}), qr.getQRByObjectIdAndType);
    router.get('/qr/:id', passport.authenticate('jwt', {session: false}), qr.getQRByID);

    router.post('/question', passport.authenticate('jwt', {session: false}), question.postQuestion);
    router.patch('/question/:id', passport.authenticate('jwt', {session: false}), question.patchQuestion);
    router.get('/question/:id', passport.authenticate('jwt', {session: false}), question.getQuestion);
    router.delete('/question/:id', passport.authenticate('jwt', {session: false}), question.deleteQuestion);

    router.get('/questions', passport.authenticate('jwt', {session: false}), questions.getQuestions);

    router.get('/options', passport.authenticate('jwt', {session: false}), options.getOptions);
    router.patch('/options', passport.authenticate('jwt', {session: false}), options.patchOptions);

    router.post('/login', auth.post_login);
    router.get('/renew',  passport.authenticate('jwt', {session: false}), auth.get_renew);

    router.post('/team', passport.authenticate('jwt', {session: false}), team.postTeam);
    router.patch('/team/:id', passport.authenticate('jwt', {session: false}), team.patchTeam);
    router.get('/team/:id', passport.authenticate('jwt', {session: false}), team.getTeam);
    router.delete('/team/:id', passport.authenticate('jwt', {session: false}), team.deleteTeam);
    
    router.get('/teams', passport.authenticate('jwt', {session: false}), teams.getTeams);

    //There are some /api routes in socket.js
    
    app.use('/api', router);
}