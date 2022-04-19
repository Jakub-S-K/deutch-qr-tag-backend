short_id = require('shortid')
short_id()
for(let x = 0; x < 10; x++) {
    let id = short_id();
    let buf = Buffer.from(id, 'utf-8')
    console.log(buf.toString('base64'))
}