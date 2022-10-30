require('mongoose');
const Users = require('../../schemas/schemas.js').users;

module.exports.get = function(req, res) {
    Users.find().sort().then(users => {
        if (users) {
            res.json(users)
        } else {
            res.sendStatus(404);
        }
    });
}