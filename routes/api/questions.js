const Question = require('../../schemas/schemas.js').questions;

module.exports.getQuestions = function (req, res) {
    Question.find({_admin: req.admin._id}).then(questions => {
        if (questions) {
            return res.json(questions)
        } else {
            return res.sendStatus(404);
        }
    })
}