const Users = require('../../../schemas/schemas.js').users;
const Admins = require('../../../schemas/schemas.js').admins;
const Questions = require('../../../schemas/schemas.js').questions;
const Answers = require('../../../schemas/schemas.js').answers;
const Teams = require('../../../schemas/schemas.js').teams;
const QR = require('../../../schemas/schemas.js').qr;
const conn = require('../../../mongoConn').db;
const count_points = require(`./post_answer.js`).count_points;

module.exports.postValidate = async function (req, res) {
    if (!req.body.qr_id) {
        console.log(req.body)
        return res.sendStatus(400);
    }
    
    const qr_id = req.body.qr_id;
    const db_conn = await conn;
    let session = await db_conn.startSession();
    session.startTransaction();
    
    try {
        const result = await QR.findOne({_id: qr_id}).session(session);
        if (!result) {
            res.sendStatus(404);
            throw 'Not found QR'
        }
        if (result.type !== 'user') {
            res.sendStatus(400);
            throw 'Wrong QR type'
        }
        
        const admin = await Admins.findById(result._admin).session(session);
        
        if (!admin) {
            res.sendStatus(401);
            throw 'Invalid Contest Owner'
        }
        
        const user = await Users.findOne({_admin: result._admin, _id: result.obj_id})
        .session(session).select('-__v').lean();
        
        if (!user) {
            res.sendStatus(404);
            throw `User not found`
        }

        const team_id_ = await Teams.findOne({_admin: result._admin, members: user._id})
        if (!team_id_) {
            res.sendStatus(404);
            thwow `Team not found`
        }
        const current_points = await Answers.find({_admin: result._admin, team_id: team_id_._id});

        const question_number = await Questions.find({_admin: result._admin}).session(session);

        user["question_number"] = question_number ? question_number.length : 0;
        user["points"] = current_points ? current_points.length : 0;
        // console.log(user);
        res.json(user);

        await session.commitTransaction();
    } catch (e) {
        console.error(e);
    } finally {
        session.endSession();
    }
}

