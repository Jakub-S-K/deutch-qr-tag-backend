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
    Admins.findOne().where('_id').in(jwt_payload.id).then(user => {
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    })
});

passport.use(this.strategy);

module.exports.post_login = function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.sendStatus(400);
        return;
    }
    const admin = Admins.findOne().where('login').in(req.body.username).then(user => {
        if (!user) {
            res.sendStatus(404);
        } else {
            var password = Buffer.from(req.body.password);

            pwd.verify(password, user.password, function (err, result) {
                if (err)
                    throw err
                switch (result) {
                    case securePassword.INVALID:
                        res.sendStatus(400);
                        return console.log('Invalid password attempt')

                    case securePassword.VALID:

                        var payload = {
                            id: user._id,
                            exp: Math.floor(Date.now() / 1000) + (60 * 120)
                        };

                        var token = jwt.sign(payload, jwtOptions.secretOrKey);
                        res.json({ token: token, expiresIn: 60*120 });
                        return console.log('Authenticated')
                    default:
                        console.log("Password error switch default has been reached");
                        break
                }
            })
        }
    })
}

module.exports.get_renew = function(req, res) {
    var payload = {
        id: req.user._id,
        exp: Math.floor(Date.now() / 1000) + (60 * 120)
    };

    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({ token: token, expiresIn: 60*120 });
}

module.exports.get_access_test = function (req, res) {
    res.sendStatus(200);
}