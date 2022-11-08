require('mongoose');
const Users = require('../../schemas/schemas.js').users;
const Qr = require('./qr.js');

module.exports.post = function (req, res) {
    if (req.body.name && req.body.surname) {
        let user = new Users({name: req.body.name, surname: req.body.surname});
        user.save((err, doc) => {
            if (!err) {
                Qr.createQR(doc._id.toHexString(), 'user').then(code =>{
                    switch (code) {
                        case 200:
                            return res.json({_id: doc._id});
                        case 409:
                            return res.sendStatus(409);
                        case 500:
                            return res.sendStatus(500);
                        default:
                            break;
                        }
                })
            } else {
                console.log('Unexpected error ocurred /api/add/user database populate');
                res.sendStatus(500);
            }
        })

    } else {
        res.sendStatus(400);
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
            res.sendStatus(404);
        }
    }); 
}

module.exports.delete = function(req, res) {
    const id = req.params.id;
    if (id.length != 12 && id.length != 24) {
        res.sendStatus(400)
    }
    
    Users.deleteOne().where('_id').in(id).then(result => {
        if (result.deletedCount != 0) {
            Qr.deleteQRbyForeignID(id, 'user').then(code => {
                switch(code) {
                    case 200:
                        return res.sendStatus(200);
                    case 404:
                        return res.sendStatus(404);
                    case 400:
                        return res.sendStatus(400);
                    default:
                        return res.sendStatus(500);
                }
            })
        } else {
            res.sendStatus(404);
        }
    })
}

module.exports.patch = function(req, res) {
    const id = req.params.id
    if (id.length != 12 && id.length != 24) {
        return res.sendStatus(400);
    }

    Users.findByIdAndUpdate(id, req.body, function (err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            if (data){
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    })
}