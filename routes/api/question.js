const Question = require('../../schemas/schemas.js').questions;
const Qr = require('./qr.js');

module.exports.postQuestion = function(req, res) {

    const question = req.body.question;
    const answer = req.body.answer;
    const answers = req.body.answers;
    
    if (!question || answer === null || answer === undefined) {
        return res.sendStatus(400);
    }

    if (!Array.isArray(req.body.answers)) {
        return res.sendStatus(400);
    }

    const answersWithoutNull = [];

    req.body.answer.forEach(answer => {
        if (answer !== null) {
            answersWithoutNull.push(answer);
        }
    })

    Question.findOne({question: question}).then(result => {
        if (result) {
            console.log(result);
            return res.sendStatus(409);
        } else {
            new Question({
                _admin: req.user._id,
                question: question,
                answers: answers,
                answer: answersWithoutNull
            }).save((err, doc) => {
                if (!err) {
                    Qr.createQR(doc._id.toHexString(), 'question', req.user._id).then(status => {
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
                    return res.sendStatus(500);
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

    delete req.body._admin;

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
    
    Question.findOne().and({_id: id}, {_admin: req.user._id}).select('-__v -_id -_admin').then(question => {
        if (question) {
            return res.json(question);
        } else {
            return res.sendStatus(404);
        }
    })
}

module.exports.deleteQuestion = async function (req, res) {
    const id = req.params.id;
    if (id.length != 24) {
        return res.sendStatus(400);
    }

    Question.deleteOne({_id: id}).then(result => {
        if (result.deletedCount != 0) {
            Qr.deleteQRbyForeignID(id, 'question').then(code => {
                switch(code) {
                    case 200:
                        return res.sendStatus(200);
                    case 404:
                        return res.sendStatus(404);
                    case 400:
                        return res.sendStatus(400);
                    default:
                        return res.sendStatus(500);
                }
            })
        } else {
            return res.sendStatus(404);
        }
    })
}