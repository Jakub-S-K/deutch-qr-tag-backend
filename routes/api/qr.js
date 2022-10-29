const { default: mongoose } = require('mongoose');

require('mongoose')

const QR_gen = require('qr-image');
const QRs = require('../../schemas/schemas.js').qr;

module.exports.getQRByQuestionID = function (req, res) {
    const id = req.params.id;
    if (id.length != 12 && id.length != 24) {
        res.status(400).json({msg: "Invalid Id format"})
        return
    }
    QRs.findOne().where('question_id').in(id).then(qr => {
        if (qr) {
            res.write(qr.img);
            res.end();
        } else {
            res.status(404).send();
        }
    })
}

module.exports.postNewQrCode = function (req, res) {
    if (!req.body.id) {
        return res.status(400).json({msg: "Invalid request format"});
    }
    let id = req.body.id;

    QRs.findOne().where('question_id').in(id).then(qr => {
        if (qr) {
            return res.status(409).json({msg: 'Conflict, Resource already exists'});
        } else {
            let qr = new QRs({
                question_id: mongoose.Types.ObjectId.createFromHexString(id),
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