const Question = require('../../schemas/schemas.js').questions;

module.exports.postQuestion = function(req, res) {
    const question = req.body.question;
    const a = req.body.a;
    const b = req.body.b;
    const c = req.body.c;
    const d = req.body.d;
    const answer = req.body.answer;

    if (!question || !a || !b || !c || !d || !answer) {
        return res.sendStatus(400);
    }
    Question.findOne().where('question').in(question).then(question => {
        if (question) {
            res.sendStatus(409);
        } else {
            new Question({
                question: question,
                a: a,
                b: b,
                c: c,
                d: d,
                answer: answer
            }).save((err, doc) => {
                if (!err) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                }
            })
        }
    })
}