const { default: mongoose } = require('mongoose');

require('mongoose')

const QR_gen = require('qr-image');
const QRs = require('../../schemas/schemas.js').qr;

module.exports.getQRByObjectIdAndType = function (req, res) {
    const id = req.params.id;
    const type = req.params.type;

    if ((id.length != 12 && id.length != 24) || !type) {
        return res.sendStatus(400);
    } else {
        QRs.findOne({_admin: req.user._id, obj_id: id, type: type}).then(qr => {
            if (qr) {
                res.write(qr.img);
                res.end();
            } else {
                res.sendStatus(404);
            }
        })
    }
}

module.exports.getQRByID = function (req, res) {
    const id = req.params.id;

    if (id.length != 12 && id.length != 24) {
        return res.sendStatus(400)
    } else {
        QRs.findOne({_admin: req.user._id, _id: id}).then(qr => {
            if (qr) {
                res.write(qr.img);
                res.end();
            } else {
                res.sendStatus(404);
            }
        })
    }
}

module.exports.postNewQrCode = function (req, res) {
    if (!req.body.obj_id || !req.body.type) {
        return res.sendStatus(400);
    }
    const id = req.body.obj_id;
    const type = req.body.type;

    createQRCodeAndSaveToDB(id, type, req.user._id).then(code => {
        switch (code) {
            case 200:
                return res.sendStatus(200);
            case 409:
                return res.sendStatus(409);
            case 500:
                return res.sendStatus(500);
            default:
                break;
            }
    });
}

function createQRCodeAndSaveToDB(obj_id, type, admin_id) {
    const id = obj_id;
    return new Promise(resolve => {
        QRs.findOne({_admin: admin_id}).and([{obj_id: id}, {type: type}])
        .then(qr => {
            if (qr) {
                resolve(409);
            } else {
                const _id = mongoose.Types.ObjectId();
                let qr = new QRs({
                    _id: _id,
                    _admin: admin_id,
                    obj_id: mongoose.Types.ObjectId.createFromHexString(id),
                    type: type,
                    img: QR_gen.imageSync(_id.toString())
                })
                qr.save((err, doc) => {
                    if (!err) {
                        resolve(200);
                    }
                    resolve(500);
                })
            }
        })
    });
    
}

function deleteQRbyForeignID(id, type) {
    return new Promise(resolve => {
        if (id.length != 24) {
            resolve(400);
        }
    
        QRs.deleteOne()
        .and([{obj_id: id}, {type: type}])        
        .then(result => {
            if (result.deletedCount > 0) {
                resolve(200);
            } else {
                resolve(404);
            }
        })
    })
}

function deleteQR(id) {
    return new Promise(resolve => {
        if (id.length != 24) {
            resolve(400);
        }
    
        QRs.deleteOne().where('_id').in(id).then(result => {
            if (result.deletedCount > 0) {
                resolve(200);
            } else {
                resolve(404);
            }
        })
    })
}

module.exports.deleteQRbyForeignID = deleteQRbyForeignID;
module.exports.deleteQR = deleteQR;
module.exports.createQR = createQRCodeAndSaveToDB;