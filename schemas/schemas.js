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
    answers: [String],
    answer: [Number]
}));

const Answers = mongoose.model('answers', mongoose.Schema({
    hash: String,
    qr_id: String,
    answer: String
}));

const Teams = mongoose.model('teams', mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.ObjectId, required: true, ref: 'users' }]
}))

const Options = mongoose.model('options', mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: 'admins'
    },
    options: [{name: String, value: String}]
}))


module.exports.admins = Admins;
module.exports.users = Users;
module.exports.questions = Questions;
module.exports.answers = Answers;
module.exports.qr = QR;
module.exports.options = Options;
module.exports.teams = Teams;