const Questions = require('../../../schemas/schemas.js').questions;
const Users = require('../../../schemas/schemas.js').users;
const Admins = require('../../../schemas/schemas.js').admins;
const Answers = require('../../../schemas/schemas.js').answers;
const QR = require('../../../schemas/schemas.js').qr;
const conn = require('../../../mongoConn').db;
const mongoose = require('mongoose');
const { use } = require('passport');

module.exports.postAnswer = async function (req, res) {
    if (! req.body.question_id || ! req.body.user_id || ! req.body.admin_id) {
        console.log('question_id: %s\nuser_id: %s\nadmin_id: %s', req.body.question_id, req.body.user_id, req.body.admin_id);
        return res.sendStatus(400);
    }

    if (! req.body.answer) {
        console.log('answer: %s', req.body.answer);
        return res.sendStatus(400);
    }

    if (req.body.question_id.length !== 24 || req.body.user_id.length !== 24 || req.body.admin_id.length !== 24) {
        console.log('length: %d, %d, %d', req.body.question_id.length, req.body.user_id.length, req.body.admin_id.length);
        return res.sendStatus(400);
    }

    const question_id = req.body.question_id;
    const user_id = req.body.user_id;
    const admin_id = req.body.admin_id;
    const user_answer = req.body.answer;

    let pvalidUser = Users.findOne({_id: user_id});
    let pvalidAdmin = Admins.findOne({_id: admin_id});
    let presult = Questions.findOne({_id: question_id});
    let panswer = Answers.findOne({qr_id: question_id, user_id: user_id});

    let [validAdmin, validUser, result, answer] = await Promise.all([pvalidAdmin, pvalidUser, presult, panswer]);

    if (!result || !validAdmin || !validUser) {
        console.log('Not found qr/admin/user');
        return res.sendStatus(404);
    }

    if (answer) {
        console.log('Already answered');
        return res.sendStatus(403);
    }

    let curr_points = current_points(user_id);

    if (result.answer.length !== user_answer.length) { // Wrong answer return points until now and save answer to db
        await new Answers({
            _admin: admin_id,
            user_id: user_id,
            qr_id: question_id,
            answer: user_answer,
            correct: 0
        }).save();
        console.log('wrong answer');
        return res.json({points: await curr_points});
    }

    let counter = 0;
    for (let i = 0; i < result.answer.length; ++ i) {
        if (result.answer[i] === user_answer[i]) {
            counter++;
        }
    }
    curr_points = (await curr_points) || 0;

    await new Answers({
        _admin: admin_id,
        user_id: user_id,
        qr_id: question_id,
        answer: user_answer,
        correct: counter
    }).save();
    return res.json({
        points: curr_points + counter
    });
}

async function current_points(user_id) {
    const points = await Answers.aggregate([
        {
            "$match": {
              "user_id": mongoose.Types.ObjectId(user_id)
            }
          },
          {
            "$group": {
              "_id": null,
              "points": {
                "$sum": "$correct"
              }
            }
          }
    ]).exec();

    console.log('points');
    console.log(points);
    return points[0]?.points;
}
