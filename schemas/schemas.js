const mongoose = require('mongoose');

const Admins = mongoose.model('admins', mongoose.Schema({ 
    login: String, 
    password: Buffer 
}));
const QR = mongoose.model('qrs', mongoose.Schema({
    type: {
        type: String,
        enum: ['user', 'question'],
        default: 'question'
    },
    obj_id: mongoose.Types.ObjectId,
    img: Buffer
}))

const Users = mongoose.model('users', mongoose.Schema({ 
    name: String, 
    surname: String 
}));

const Questions = mongoose.model('questions', mongoose.Schema({
    qr_id: String,
    question: String,
    a: String,
    b: String,
    c: String,
    d: String,
    answer: String
}));

const Answers = mongoose.model('answers', mongoose.Schema({ 
    hash: String, 
    qr_id: String, 
    answer: String 
}));


module.exports.admins = Admins;
module.exports.users = Users;
module.exports.questions = Questions;
module.exports.answers = Answers;
module.exports.qr = QR;