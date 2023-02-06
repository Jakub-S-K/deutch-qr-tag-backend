const Questions = require('../../../schemas/schemas.js').questions;

module.exports.getQuestion = async function (req, res) {
    const id = req.params.id;
    const admin_id = req.params.admin_id;

    if (!id || !admin_id) {
        return res.sendStatus(400);
    } 

    if (id.length != 24 || admin_id.length != 24) {
        return res.sendStatus(400);
    }

    const question = await Questions.findOne({_id: id, _admin: admin_id}).select('-_id -__v -_admin');

    if (!question) {
        return res.sendStatus(404);
    }

    return res.json(question);
}