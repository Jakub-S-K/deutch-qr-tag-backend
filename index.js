const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

var bodyParser = require("body-parser");

require('dotenv').config();

const limiter = rateLimit.rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 6000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express()

const httpServer = createServer(app);
const io = new Server(httpServer, {});

//const expressWs = require('express-ws')(app);

const router = express.Router();

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
require('./routes/socket.js')(app, io);

router.post('/settings', (req, res) => {
    if (req.body.status && req.body.auth == process.env.AUTH_KEY) {
        GlobalStatus = req.body.status; // Turn off sending answers
    } else {
        res.json({ok: false});
    }
    res.json({ok: true})
});

app.use('/', router);

httpServer.listen(process.env.PORT, () => console.log("Server is running on PORT " + process.env.PORT))
