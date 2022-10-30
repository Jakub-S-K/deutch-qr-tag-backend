require('mongoose');
const Users = require('../../schemas/schemas.js').users;
const qr = require('./qr.js');

module.exports.post = function (req, res) {
    if (req.body.name && req.body.surname) {
        let user = new Users({name: req.body.name, surname: req.body.surname});
        user.save((err, doc) => {
            if (!err) {
                qr.createQR(doc._id.toHexString(), 'user').then(code =>{
                    switch (code) {
                        case 200:
                            return res.json({msg: 'ok', _id: doc._id});
                        case 409:
                            return res.status(409).json({msg: 'User created, but there\'s conflict with qr code'});
                        case 500:
                            return res.status(500).json({msg: 'Internal server error while saving qr code'});
                        default:
                            break;
                        }
                })
            } else {
                console.log('Unexpected error ocurred /api/add/user database populate');
                res.status(500).json({msg: 'Interval server error'})
            }
        })

    } else {
        console.log(req.name);
        console.log(req.surname);
        res.status(400).json({msg: 'Invalid request format'});
    } 
}

module.exports.get = function (req, res) {
    const id = req.params.id;
    if (id.length != 12 && id.length != 24) {
        res.status(400).json({msg: "Invalid Id format"})
        return
    }
    Users.findOne().where('_id'). in (id).then(user => {
        if (user) {
            res.json(user)
        } else {
            res.status(404).json({msg: "User with given id doesn't exist"})
        }
    }); 
}

module.exports.delete = function(req, res) {
    const id = req.params.id;
    if (id.length != 12 && id.length != 24) {
        res.status(400).json({msg: "Invalid Id format"})
    }
    Users.findByIdAndDelete(id, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            if (! docs) { // console.log('Resource not found');
                res.status(406).json({msg: "Resource not found"});
            } else { // console.log("Deleted :", docs);
                res.status(200).json({msg: 'Ok'});
            }
        }
    })
}

module.exports.patch = function(req, res) {
    const id = req.params.id
    if (id.length != 12 && id.length != 24) {
        return res.status(400).json({msg: "Invalid Id format"});
    }

    Users.findByIdAndUpdate(id, req.body, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json({msg: 'ok'})
        }
    })
}