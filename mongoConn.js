const mongoose = require('mongoose');

const username = encodeURIComponent(process.env.DB_USR_LOGIN);
const password = encodeURIComponent(process.env.DB_USR_PASS);
const cluster = process.env.DB_CLUSTER;
const database = process.env.DB_NAME;


let uri = `mongodb+srv://${username}:${password}@${cluster}/${database}`;

let db = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.export = db;