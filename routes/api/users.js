require('mongoose');
const Users = require('../../schemas/schemas.js').users;

module.exports.get = function(req, res) {
    Users.find().sort().then(users => {
        if (users) {
            res.json(users)
        } else {
            res.status(404).json({message: "There are no users"})
        }
    });
}