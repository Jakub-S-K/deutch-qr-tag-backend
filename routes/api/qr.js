const { default: mongoose } = require('mongoose');

require('mongoose')

const QR_gen = require('qr-image');
const QRs = require('../../schemas/schemas.js').qr;

module.exports.getQRByQuestionID = function (req, res) {
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

module.exports.postNewQrCode = function (req, res) {
    if (!req.body.obj_id || !req.body.type) {
        return res.status(400).json({msg: "Invalid request format"});
    }
    const id = req.body.obj_id;
    const type = req.body.type;

    QRs.findOne().and([{obj_id: id}, {type: type}])
    .then(qr => {
        if (qr) {
            return res.status(409).json({msg: 'Conflict, Resource already exists'});
        } else {
            let qr = new QRs({
                obj_id: mongoose.Types.ObjectId.createFromHexString(id),
                type: type,
                img: QR_gen.imageSync(id)
            })
            qr.save((err, doc) => {
                if (!err) {
                    return res.json({msg: 'Ok'})
                }
                return res.status(500).json({msg: 'Internal server error'})
            })
        }
    })
}