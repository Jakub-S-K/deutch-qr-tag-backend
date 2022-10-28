// short_id = require('shortid')
// short_id()
// for(let x = 0; x < 10; x++) {
//     let id = short_id();
//     let buf = Buffer.from(id, 'utf-8')
//     console.log(buf.toString('base64'))
// }

const QRCode = require('qr-image')
var buf = QRCode.imageSync('hohotest')
console.log(buf)