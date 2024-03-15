const { options } = require('../../../schemas/schemas.js');

const Options = require('../../../schemas/schemas.js').options;
const conn = require('../../../mongoConn').db;

module.exports.getCompetitionName = async function (req, res) {
    const admin_id = req.params.id;

    const db_conn = await conn;
    let session = await db_conn.startSession();
    session.startTransaction();
    try {
        const result = await options.findOne({}).session(session);
        if (!result) {
            res.sendStatus(404);
            throw 'Not found'
        }
        let name = "";
        for (let i = 0; i < result.options.length; i++) {
            if (result.options[i].name === "title") {
                name = result.options[i].value;
            }
        }

        res.json({title: name});

        await session.commitTransaction();
    } catch (e) {
        console.error(e);
    } finally {
        session.endSession();
    }
}