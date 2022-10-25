const Schemas = require('../schemas/schemas.js');

const Admins = Schemas.admins;
const Users = Schemas.users;
const Questions = Schemas.questions;
const Answers = Schemas.answers;

module.exports.post_checkuser = function (req, res) {
    if (req.body.hash) {
        const query = Users.findOne().where('hash'). in (req.body.hash).then(user => {
            if (user) {
                res.json({ok: true})
            } else {
                res.json({ok: false})
            }
        })
    } else {
        res.status(404);
        res.json({ok: false});
    }
}

module.exports.post_userinfo = function (req,res) {
    if (req.body.hash) {
        const query = Users.findOne().where('hash'). in (req.body.hash).then(user => {
            if (user) {
                res.json(user);
            } else {
                res.json({ok: false});
            }
        })
    } else {
        res.status(404);
        res.json({ok: false});
    }
}

module.exports.post_question = function (req, res) {
    if (req.body.qr_id) {
        const query = Questions.findOne().where('qr_id'). in (req.body.qr_id).then(question => {
            if (question) {
                res.json(question);
            } else {
                res.json({ok: false});
            }
        })
    } else {
        res.status(404);
        res.json({ok: false});
    }
}

module.exports.post_answer = function (req, res) {
    if (req.body.qr_id && req.body.hash && req.body.answer && GlobalStatus == true) {
        Answers.findOne().and([
            {
                qr_id: req.body.qr_id
            }, {
                hash: req.body.hash
            }
        ]).then(answer => {
            if (answer) {
                res.json({ok: false, answered: true})
            } else {
                let answer = new Answers({hash: req.body.hash, qr_id: req.body.qr_id, answer: req.body.answer})
                answer.save((err, doc) => {
                    if (!err) {

                        Answers.aggregate([
                            {
                                $match: {
                                    hash: req.body.hash
                                }
                            },
                            {
                                $lookup: {
                                    from: "questions",
                                    localField: "qr_id",
                                    foreignField: "qr_id",
                                    as: "eval"
                                }
                            },
                            {
                                $project: {
                                    hash: 1,
                                    qr_id: 1,
                                    answer_correct: "$eval.answer",
                                    answer: 1
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $in: ["$answer", "$answer_correct"]
                                    }
                                }
                            }, {
                                $group: {
                                    hash: "$hash",
                                    count: {
                                        $sum: 1
                                    }
                                }
                            }, {
                                $sort: {
                                    count: -1
                                }
                            }

                        ], (err, result) => {
                            if (err) {
                                res.json({ok: false, err: true});
                            } else {
                                if (!result[0]) {
                                    res.json({ok: false})
                                } else {
                                    res.json(result[0]);
                                }
                            }
                        });
                    } else {
                        res.json({ok: false})
                    }
                });
            }
        });

    } 
}

module.exports.post_points = function (req,res) {
    if (req.body.hash) {
        Answers.aggregate([
            {
                $match: {
                    hash: req.body.hash
                }
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "qr_id",
                    foreignField: "qr_id",
                    as: "eval"
                }
            },
            {
                $project: {
                    hash: 1,
                    qr_id: 1,
                    answer_correct: "$eval.answer",
                    answer: 1
                }
            },
            {
                $match: {
                    $expr: {
                        $in: ["$answer", "$answer_correct"]
                    }
                }
            }, {
                $group: {
                    _id: "$hash",
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    count: -1
                }
            }

        ], (err, result) => {
            if (err) {
                res.json({ok: false, err: true});
            } else {
                if (!result[0]) {
                    res.json({ok: false, answered: true})
                } else {
                    res.json(result[0]);
                }
            }
        });
    }
}

module.exports.post_ranking = function (req, res) {
    Answers.aggregate([
        {
            $lookup: {
                from: "questions",
                localField: "qr_id",
                foreignField: "qr_id",
                as: "eval"
            }
        },
        {
            $project: {
                hash: 1,
                qr_id: 1,
                answer_correct: "$eval.answer",
                answer: 1
            }
        },
        {
            $match: {
                $expr: {
                    $in: ["$answer", "$answer_correct"]
                }
            }
        },
        {
            $group: {
                _id: "$hash",
                count: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                count: -1
            }
        }, {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "hash",
                as: "champion"
            }
        }

    ], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ok: false});
        } else {
            res.json(result);
        }
    })
}