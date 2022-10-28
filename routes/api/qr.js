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
    QRs.findById(id, function (err, data) {
        if (err) {
            console.log('Error in /get/qr');
            return res.status(500).json({msg: 'Internal Error'});
        }
        console.log(data);
        res.write(data['data']['img']);
        res.end();
    });
}

module.exports.postNewQrCode = function (req, res) {
    if (!req.body.text || !req.body.id) {
        return res.status(400).json({msg: "Invalid request format"});
    }
    let id = req.body.id;
    let text = req.body.text;
    let qr = new QRs({
        id: mongoose.Types.ObjectId.createFromHexString(id),
        data: {decoded: text, img: QR_gen.imageSync(text)}
    })
    qr.save((err, doc) => {
        if (!err) {
            console.log(doc);
            return res.json({msg: 'Ok'})
        }
        console.log('error');
        return res.status(500).json({msg: 'Internal server error'})
    })
}