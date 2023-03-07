const Questions = require('../../../schemas/schemas.js').questions;
const Users = require('../../../schemas/schemas.js').users;
const Admins = require('../../../schemas/schemas.js').admins;
const Answers = require('../../../schemas/schemas.js').answers;
const Teams = require('../../../schemas/schemas.js').teams;
const mongoose = require('mongoose');

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
    let panswer = Answers.findOne({qr_id: question_id, user_id: user_id}).lean();
    let pteam = Teams.findOne({"members": user_id});

    let [validAdmin, validUser, result, answer, team] = await Promise.all([pvalidAdmin, pvalidUser, presult, panswer, pteam]);

    if (!result || !validAdmin || !validUser || !team) {
        console.log('Not found qr/admin/user');
        return res.sendStatus(404);
    }

    if (answer) {
        console.log('Already answered');
        return res.sendStatus(403);
    }

    let curr_points = current_points(team._id);


    let counter = 0;
    for (let i = 0; i < user_answer.length; ++ i) {
        if (result.answer.includes(user_answer[i])) {
            counter++;
        }
    }
    curr_points = (await curr_points) || 0;

    await new Answers({
        _admin: admin_id,
        user_id: user_id,
        team_id: team._id,
        qr_id: question_id,
        answer: user_answer,
        correct: counter
    }).save();
    return res.json({
        points: curr_points + counter
    });
}

async function current_points(team_id) {
    const points = await Answers.aggregate([
        {
            "$match": {
              "team_id": mongoose.Types.ObjectId(team_id)
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

    return points[0]?.points;
}
