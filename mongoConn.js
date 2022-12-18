const mongoose = require('mongoose');

const username = encodeURIComponent(process.env.DB_USR_LOGIN);
const password = encodeURIComponent(process.env.DB_USR_PASS);
const cluster = process.env.DB_CLUSTER;
const database = process.env.DB_NAME;


let uri = `mongodb+srv://${username}:${password}@${cluster}/${database}`;

let db = mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports.db = db;

module.exports.db_rdy = function () {
    return new Promise(resolve => {
        var conn = mongoose.connection;
        conn.on('error', function () {
            resolve(false)
            process.exit(1);
        });
        conn.once('open', function () {
            resolve(true)
        });
    })
}
