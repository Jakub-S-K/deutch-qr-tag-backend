const Users = require('../../../schemas/schemas.js').users;
const Admins = require('../../../schemas/schemas.js').admins;
const QR = require('../../../schemas/schemas.js').qr;
const conn = require('../../../mongoConn').db;

module.exports.postValidate = async function (req, res) {
    if (!req.body.qr_id) {
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
                    .session(session).select('-__v')
        
        if (!user) {
            res.sendStatus(404);
            throw 'Not found user'
        }
        res.json(user);

        await session.commitTransaction();
    } catch (e) {
        session.abortTransaction();
        console.error(e);
    } finally {
        session.endSession();
    }
}