const { Router } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const short_id = require('shortid')
const cors = require('cors');

require('dotenv').config();

const app = express()
const router = express.Router();
const username = encodeURIComponent(process.env.DB_USR_LOGIN);
const password = encodeURIComponent(process.env.DB_USR_PASS);
const cluster = process.env.DB_CLUSTER;
const database = process.env.DB_NAME;

var GlobalStatus = true

let uri = `mongodb+srv://${username}:${password}@${cluster}/${database}`;

app.use(express.json());
app.use(cors());

mongoose.connect(
    uri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const Users = mongoose.model('users', mongoose.Schema(
    {
        name: String,
        surname: String,
        hash: String
    }
));

const Questions = mongoose.model('questions', mongoose.Schema(
    {
        qr_id: String,
        question: String,
        a: String,
        b: String,
        c: String,
        d: String,
        answer: String
    }
));

const Answers = mongoose.model('answers', mongoose.Schema(
    {
        hash: String,
        qr_id: String,
        answer: String
    }
));

if (process.env.LE_URL && process.env.LE_CONTENT) {
    app.get(process.env.LE_URL, function(req, res) {
      return res.send(process.env.LE_CONTENT)
    });
}

router.post('/checkuser', (req,res)=> {
    if(req.body.hash) {
        const query = Users.findOne().
            where('hash').in(req.body.hash)
            .then(user => {
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
});

router.post('/userinfo', (req,res)=> {
    if(req.body.hash) {
        const query = Users.findOne().
            where('hash').in(req.body.hash)
            .then(user => {
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
});



router.post('/question', (req, res) => {
    if (req.body.qr_id) {
        const query = Questions.findOne()
        .where('qr_id').in(req.body.qr_id)
        .then(question => {
            if (question){
                res.json(question);
            } else {
                res.json({ok: false});
            }
        })
    } else {
        res.status(404);
        res.json({ok: false});
    }
});

router.post('/answer', (req, res) => {
    if (req.body.qr_id && req.body.hash && req.body.answer && GlobalStatus == true) {
        Answers.findOne()
        .and([{qr_id: req.body.qr_id},{hash: req.body.hash}])
        .then(answer => {
            if (answer) {
                res.json({ok: false, answered: true})
            } else {
                let answer = new Answers({
                    hash: req.body.hash,
                    qr_id: req.body.qr_id,
                    answer: req.body.answer
                })
                answer.save((err, doc) => {
                    if (!err) {
                        
                        Answers.aggregate([
                            {
                                $match: {
                                    hash: req.body.hash
                                }
                            },
                            {
                                $lookup:
                                {
                                    from: "questions",
                                    localField: "qr_id",
                                    foreignField: "qr_id",
                                    as: "eval"
                                }
                            },
                            {
                                $project:
                                {
                                    hash: 1,
                                    qr_id: 1,
                                    answer_correct: "$eval.answer",
                                    answer: 1
                                }
                            },
                            {
                                $match: { $expr: {
                                     $in: ["$answer", "$answer_correct"]
                                    }
                                }
                            },
                            {
                                $group:
                                {
                                    hash: "$hash",
                                    count: {$sum: 1}
                                }
                             },
                             {
                                 $sort:
                                    {
                                        count: -1
                                    }
                             }
                            
                        ], (err, result) =>{
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
});

router.post('/points', (req, res) => {
    if (req.body.hash) {
        Answers.aggregate([
            {
                $match: {
                    hash: req.body.hash
                }
            },
            {
                $lookup:
                {
                    from: "questions",
                    localField: "qr_id",
                    foreignField: "qr_id",
                    as: "eval"
                }
            },
            {
                $project:
                {
                    hash: 1,
                    qr_id: 1,
                    answer_correct: "$eval.answer",
                    answer: 1
                }
            },
            {
                $match: { $expr: {
                     $in: ["$answer", "$answer_correct"]
                    }
                }
            },
            {
                $group:
                {
                    _id: "$hash",
                    count: {$sum: 1}
                }
             },
             {
                 $sort:
                    {
                        count: -1
                    }
             }
         
        ], (err, result) =>{
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
})

router.post('/settings', (req, res) => {
    if (req.body.status && req.body.auth == process.env.AUTH_KEY) {
        GlobalStatus = req.body.status; //Turn off sending answers
    } else {
        res.json({ok: false});
    }
    res.json({ok: true})
});

router.post('/ranking', (req, res) => {
    Answers.aggregate([
        {
            $lookup:
            {
                from: "questions",
                localField: "qr_id",
                foreignField: "qr_id",
                as: "eval"
            }
        },
        {
            $project:
            {
                hash: 1,
                qr_id: 1,
                answer_correct: "$eval.answer",
                answer: 1
            }
        },
        {
            $match: { $expr: {
                 $in: ["$answer", "$answer_correct"]
                }
            }
        },
        {
            $group:
            {
                _id: "$hash",
                count: {$sum: 1}
            }
         },
         {
             $sort:
                {
                    count: -1
                }
         },
         {
             $lookup:
             {
                 from: "users",
                 localField: "_id",
                 foreignField: "hash",
                 as: "champion"
             }
         }
        
    ], (err, result) =>{
        if (err) {
            console.log(err);
            res.json({ok: false});
        } else {
            res.json(result);
        }
    })
});

app.use('/', router);

app.listen(process.env.PORT, () => console.log("Server is running on PORT " + process.env.PORT))