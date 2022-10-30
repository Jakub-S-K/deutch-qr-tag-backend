const Question = require('../../schemas/schemas.js').questions;
const Qr = require('./qr.js');

module.exports.postQuestion = function(req, res) {
    let question = req.body.question;
    let a = req.body.a;
    let b = req.body.b;
    let c = req.body.c;
    let d = req.body.d;
    let answer = req.body.answer;

    if (!question || !a || !b || !c || !d || !answer) {
        return res.sendStatus(400);
    }
    
    Question.findOne().where('question').in(question).then(result => {
        if (result) {
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
                    Qr.createQR(doc._id.toHexString(), 'question').then(status => {
                        switch(status) {
                            case 200:
                                res.json({_id: doc._id});
                                break;
                            case 409:
                                return res.sendStatus(409)
                            case 500:
                                return res.sendStatus(500);
                            default:
                                break;
                        }
                    })
                } else {
                    res.sendStatus(500);
                }
            })
        }
    })
}

module.exports.patchQuestion = function (req, res) {
    const id = req.params.id;
    if (id.length != 24) {
        return res.sendStatus(400);
    }
    Question.findByIdAndUpdate(id, req.body, function (err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            if (data) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    })
}

module.exports.getQuestion = function (req, res) {
    const id = req.params.id;
    if (id.length != 24) {
        return res.sendStatus(400);
    }
    
    Question.findOne().where('_id').in(id).then(question => {
        if (question) {
            return res.json(question);
        } else {
            return res.sendStatus(404);
        }
    })
}

module.exports.deleteQuestion = function (req, res) {
    const id = req.params.id;
    if (id.length != 24) {
        return res.sendStatus(400);
    }

    Question.deleteOne().where('_id').in(id).then(result => {
        if (result.deletedCount != 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    })
}