const {Router} = require('express');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');

const Schemas = require('./schemas/schemas.js');

const Admins = Schemas.admins;
const Users = Schemas.users;
const Questions = Schemas.questions;

var _ = require("lodash");
var bodyParser = require("body-parser");

require('dotenv').config();

const limiter = rateLimit.rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 6000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

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

app.use(limiter);
app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors());

if (process.env.LE_URL && process.env.LE_CONTENT) {
    app.get(process.env.LE_URL, function (req, res) {
        return res.send(process.env.LE_CONTENT)
    });
}

require('./routes/routers.js')(app);
require('./routes/old_routes.js')(app);

router.post('/settings', (req, res) => {
    if (req.body.status && req.body.auth == process.env.AUTH_KEY) {
        GlobalStatus = req.body.status; // Turn off sending answers
    } else {
        res.json({ok: false});
    }
    res.json({ok: true})
});


router.post("/api/send", (req, res) => { // console.log(req.body);
    if (!req.body.message) {
        res.status(400).json({message: 'Invalid request format'});
        return;
    }
    if (!req.app.locals.clients) {
        res.status(404).json({message: 'There are no connected clients'})
        return
    }
    // console.log(JSON.stringify({message: req.body.message}));
    broadcast(req.app.locals.clients, JSON.stringify({message: req.body.message}));

    res.sendStatus(200);
});

const broadcast = (clients, message) => {
    if (!clients) {
        return;
    }
    clients.forEach((client) => {
        if (client.readyState === expressWs.getWss().WebSocket.OPEN) {
            client.send(message);
        }
    });
};

app.ws('/api/socket/broadcast', function (ws, req) {
    ws.on('message', function (msg) {
        // console.log("Total connected clients:", expressWs.getWss().clients.size);
        // console.log(msg);
        ws.send(msg);

        app.locals.clients = expressWs.getWss().clients;
    });
});


app.use('/', router);

app.listen(process.env.PORT, () => console.log("Server is running on PORT " + process.env.PORT))
