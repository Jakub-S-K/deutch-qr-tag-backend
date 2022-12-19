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
    _admin: {
        type: mongoose.Types.ObjectId,
        require: true,
        ref: 'admins'
    },
    obj_id: mongoose.Types.ObjectId,
    img: Buffer
}))

const Users = mongoose.model('users', mongoose.Schema({
    _admin: {
        type: mongoose.Types.ObjectId,
        require: true,
        ref: 'admins'
    },
    name: String,
    surname: String
}));

const Questions = mongoose.model('questions', mongoose.Schema({
    _admin: {
        type: mongoose.Types.ObjectId,
        require: true,
        ref: 'admins'
    },
    qr_id: String,
    question: String,
    answers: [String],
    answer: [Number]
}));

const Answers = mongoose.model('answers', mongoose.Schema({
    _admin: {
        type: mongoose.Types.ObjectId,
        require: true,
        ref: 'admins'
    },
    hash: String,
    qr_id: String,
    answer: String
}));

const Teams = mongoose.model('teams', mongoose.Schema({
    _admin: {
        type: mongoose.Types.ObjectId,
        require: true,
        ref: 'admins'
    },
    name: String,
    members: [{ type: mongoose.Schema.ObjectId, required: true, ref: 'users' }]
}))

const Options = mongoose.model('options', mongoose.Schema({
    _admin: {
        type: mongoose.Types.ObjectId,
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