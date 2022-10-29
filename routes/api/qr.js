const { default: mongoose } = require('mongoose');

require('mongoose')

const QR_gen = require('qr-image');
const QRs = require('../../schemas/schemas.js').qr;

module.exports.getQRByQuestionID = function (req, res) {
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
        return res.status(400).json({msg: "Invalid request format"});
    }
    const id = req.body.obj_id;
    const type = req.body.type;

    QRs.findOne().and([{obj_id: id}, {type: type}])
    .then(qr => {
        if (qr) {
            return res.status(409).json({msg: 'Conflict, Resource already exists'});
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
                    return res.json({msg: 'Ok'})
                }
                return res.status(500).json({msg: 'Internal server error'})
            })
        }
    })
}