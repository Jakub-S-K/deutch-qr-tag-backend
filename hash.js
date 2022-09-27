const {Router} = require('express');
const express = require('express');
const mongoose = require('mongoose');
const short_id = require('shortid')
const cors = require('cors');

mongoose.SchemaTypes.Buffer
require('dotenv').config();

const app = express()
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


const securePassword = require('secure-password')

// Initialise our password policy
const pwd = securePassword();

const userPassword = Buffer.from('cQkZoZ4s');

(async () => {
    const hash = await pwd.hash(userPassword)
    
    console.log(hash);

    

const Admins = mongoose.model('admins', mongoose.Schema({login: String, password: Buffer}));

let admin = new Admins({login: 'admin', password: hash});

admin.save((err, doc) => {
    if (!err) {
        console.log("HOHOHO poszlo w eterrer");
    } else {
        console.log("no i dupa");
        console.log(err);
    }
});

})();