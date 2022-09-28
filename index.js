const {Router} = require('express');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');

const securePassword = require('secure-password')

const pwd = securePassword()


var _ = require("lodash");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');

require('dotenv').config();

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();;
jwtOptions.secretOrKey = process.env.JWT_SECRET;

const Admins = mongoose.model('admins', mongoose.Schema({login: String, password: Buffer}));

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    Admins.findOne().where('_id'). in (jwt_payload.id).then(user => {
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    })
});

passport.use(strategy);


const app = express()
const router = express.Router();

const expressWs = require('express-ws')(app);

const username = encodeURIComponent(process.env.DB_USR_LOGIN);
const password = encodeURIComponent(process.env.DB_USR_PASS);
const cluster = process.env.DB_CLUSTER;
const database = process.env.DB_NAME;

var GlobalStatus = true

let uri = `mongodb+srv://${username}:${password}@${cluster}/${database}`;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors());

const Users = mongoose.model('users', mongoose.Schema({name: String, surname: String, hash: String}));


const Questions = mongoose.model('questions', mongoose.Schema({
    qr_id: String,
    question: String,
    a: String,
    b: String,
    c: String,
    d: String,
    answer: String
}));

const Answers = mongoose.model('answers', mongoose.Schema({hash: String, qr_id: String, answer: String}));

if (process.env.LE_URL && process.env.LE_CONTENT) {
    app.get(process.env.LE_URL, function (req, res) {
        return res.send(process.env.LE_CONTENT)
    });
}

router.get("/api/access_test", passport.authenticate('jwt', {session: false}), function (req, res) {
    res.json({message: "Success! You can not see this without a token"});
});

router.post("/api/login", function (req, res) {
    if (req.body.username && req.body.password) {
        var name = req.body.name;
        var password = req.body.password;
    } else {
        res.status(400).json({message: "Invalid data format"});
        return;
    }
    const admin = Admins.findOne().where('login'). in (req.body.username).then(user => {
        if (!user) {
            res.status(404).json({message: "There is no such a user"});
        }
        var password = Buffer.from(req.body.password);

        pwd.verify(password, user.password, function (err, result) {
            if (err) 
                throw err

            

            switch (result) {
                case securePassword.INVALID: res.status(400).json({message: "Password did not match"});
                    return console.log('Invalid password attempt')

                case securePassword.VALID:

                    var payload = {
                        id: user._id
                    };
                    var token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.json({message: "ok", token: token});
                    return console.log('Authenticated')
                default:
                    console.log("Password error switch default has been reached");
                    break
            }
        })
    })
});

router.get("/api/users", passport.authenticate('jwt', {session: false}), function (req, res) {
    const query = Users.find().sort().then(users => {
        if (users) {
            res.json(users)
        } else {
            res.status(404).json({message: "There are no users"})
        }
    });
});
router.get("/api/user/:id", passport.authenticate('jwt', {session: false}), function (req, res) {
    const id = req.params.id;
    if (id.length != 12 && id.length != 24) {
        res.status(400).json({message: "Invalid Id format"})
        return
    }
    const query = Users.findOne().where('_id'). in (id).then(user => {
        if (user) {
            res.json(user)
        } else {
            res.status(404).json({message: "User with given id doesn't exist"})
        }
    });
});


router.post('/checkuser', (req, res) => {
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
});

router.post('/userinfo', (req, res) => {
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
});


router.post('/question', (req, res) => {
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
});

router.post('/answer', (req, res) => {
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
})

router.post('/settings', (req, res) => {
    if (req.body.status && req.body.auth == process.env.AUTH_KEY) {
        GlobalStatus = req.body.status; // Turn off sending answers
    } else {
        res.json({ok: false});
    }
    res.json({ok: true})
});

router.post('/ranking', (req, res) => {
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
});

router.post("/api/send", (req, res) => {
    //console.log(req.body);
    if (!req.body.message) {
        res.status(400).json({message: 'Invalid request format'});
        return;
    }
    if (!req.app.locals.clients) {
        res.status(404).json({message: 'There are no connected clients'})
    }
    //console.log(JSON.stringify({message: req.body.message}));
    broadcast(req.app.locals.clients, JSON.stringify({message: req.body.message}));

    res.sendStatus(200);
});

const broadcast = (clients, message) => {
    if (!clients) {
        return;
    }
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};


 app.ws('/api/socket/broadcast', function(ws, req) {
    ws.on('message', function(msg) {
        //console.log("Total connected clients:", expressWs.getWss().clients.size);
        //console.log(msg);
        ws.send(msg);

        app.locals.clients = expressWs.getWss().clients;
    });
 });


app.use('/', router);

app.listen(process.env.PORT, () => console.log("Server is running on PORT " + process.env.PORT))
