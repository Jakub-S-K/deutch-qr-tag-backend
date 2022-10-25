const express = require('express');
const other = require('./other.js');

module.exports = function (app) {
    const router = express.Router();

    router.post('/checkuser', other.post_checkuser);
    router.post('/userinfo', other.post_userinfo);
    router.post('/question', other.post_question);
    router.post('/answer', other.post_answer);
    router.post('/points', other.post_points);
    router.post('/ranking', other.post_ranking);

    app.use('/', router);
}