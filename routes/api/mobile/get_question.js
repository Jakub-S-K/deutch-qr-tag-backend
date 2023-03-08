const Questions = require('../../../schemas/schemas.js').questions;
const QR = require('../../../schemas/schemas.js').qr;
const conn = require('../../../mongoConn').db;

module.exports.getQuestion = async function (req, res) {
    const id = req.params.id;

    const db_conn = await conn;
    let session = await db_conn.startSession();
    session.startTransaction();
    
    try {
        const result = await QR.findOne({_id: id}).session(session);
        if (!result) {
            res.sendStatus(404);
            throw 'Not found QR'
        }
        if (result.type !== 'question') {
            res.sendStatus(400);
            throw 'Wrong QR type'
        }
        
        const question = await Questions.findById(result.obj_id).session(session).select('-_id -__v -_admin');
        
        if (!question) {
            res.sendStatus(404);
            throw 'Question not found'
        }
        
        res.json(question);

        await session.commitTransaction();
    } catch (e) {
        session.abortTransaction();
        console.error(e);
    } finally {
        session.endSession();
    }



    // if (!id || !admin_id) {
    //     console.warn('id or admin_id not present, %s, %s', id, admin_id);
    //     return res.sendStatus(400);
    // } 

    // if (id.length != 24 || admin_id.length != 24) {
    //     console.warn('invalid length id %d, admin_id %d', id.length, admin_id.length);
    //     return res.sendStatus(400);
    // }
    // console.log('id: %s\nadmin_id: %s', id, admin_id);
    // const question = await Questions.findOne({_id: id, _admin: admin_id}).select('-_id -__v -_admin');

    // if (!question) {
    //     return res.sendStatus(404);
    // }

    // return res.json(question);
}