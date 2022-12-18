const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
var bodyParser = require("body-parser");

require('dotenv').config();

const db = require('./mongoConn.js').db;

const limiter = rateLimit.rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // Limit each IP to 6000 requests per `window` (here, per 10 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express()

const httpServer = createServer(app);
const io = new Server(httpServer, {path: '/socket'});

const router = express.Router();

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

app.use('/', router);

const db_rdy = require('./mongoConn.js').db_rdy().then(good => {
    if (good) {
        httpServer.listen(process.env.PORT, () => console.log("Server is running on PORT " + process.env.PORT))
    } else {
        console.error("Failed to connect to database");
    }
})
