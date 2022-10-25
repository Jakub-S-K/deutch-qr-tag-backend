const Admins = require('../../schemas/schemas.js').admins;

const securePassword = require('secure-password');

const pwd = securePassword();
var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();;
jwtOptions.secretOrKey = process.env.JWT_SECRET;

module.exports.strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    Admins.findOne().where('_id'). in (jwt_payload.id).then(user => {
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    })
});

passport.use(this.strategy);

module.exports.post_login = function (req, res) {
    if (req.body.username && req.body.password) {
        var name = req.body.name;
        var password = req.body.password;
    } else {
        res.status(400).json({message: "Invalid data format"});
        return;
    }
    const admin = Admins.findOne().where('login'). in (req.body.username).then(user => {
        if (!user) {
            res.status(404).json({message: "There is no such a user"});
        }
        var password = Buffer.from(req.body.password);

        pwd.verify(password, user.password, function (err, result) {
            if (err) 
                throw err
            switch (result) {
                case securePassword.INVALID: res.status(400).json({message: "Password did not match"});
                    return console.log('Invalid password attempt')

                case securePassword.VALID:

                    var payload = {
                        id: user._id,
                        exp: Math.floor(Date.now() / 1000) + (60 * 120)
                    };

                    var token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.json({message: "ok", token: token});
                    return console.log('Authenticated')
                default:
                    console.log("Password error switch default has been reached");
                    break
            }
        })
    })
}

module.exports.get_access_test = function (req, res) {
    res.json({message: "Success! You can not see this without a token"});
}