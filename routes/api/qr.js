const { default: mongoose } = require('mongoose');

require('mongoose')

const QR_gen = require('qr-image');
const QRs = require('../../schemas/schemas.js').qr;

module.exports.getQRByObjectIdAndType = function (req, res) {
    const id = req.params.id;
    const type = req.params.type;

    if ((id.length != 12 && id.length != 24) || !type) {
        return res.status(400).json({msg: "Invalid parameters"})
    } else {
        QRs.findOne().and([{obj_id: id}, {type: type}]).then(qr => {
            if (qr) {
                res.write(qr.img);
                res.end();
            } else {
                res.status(404).send();
            }
        })
    }
}

module.exports.getQRByID = function (req, res) {
    const id = req.params.id;

    if (id.length != 12 && id.length != 24) {
        return res.status(400).json({msg: "Invalid parameters"})
    } else {
        QRs.findOne().where('_id').in(id).then(qr => {
            if (qr) {
                res.write(qr.img);
                res.end();
            } else {
                res.status(404).send();
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
    createQRCodeAndSaveToDB(id, type).then( code => {
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

function createQRCodeAndSaveToDB(obj_id, type) {
    const id = obj_id;
    return new Promise(resolve => {
        QRs.findOne().and([{obj_id: id}, {type: type}])
        .then(qr => {
            if (qr) {
                resolve(409);
            } else {
                const _id = mongoose.Types.ObjectId();
                let qr = new QRs({
                    _id: _id,
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

module.exports.createQR = createQRCodeAndSaveToDB;