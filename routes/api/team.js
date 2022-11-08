const Teams = require('../../schemas/schemas.js').teams;

module.exports.postTeam = function (req, res) {
    if (!req.body.name) {
        return res.sendStatus(400);
    }

    Teams.findOne({ name: req.body.name }).then(team => {
        if (!team) {
            new Teams({
                name: req.body.name
            }).save(err => {
                if (err) {
                    return res.sendStatus(500);
                } else {
                    return res.sendStatus(200);
                }
            })
        } else {
            return res.sendStatus(409);
        }
    })
}

module.exports.patchTeam = async function (req, res) {
    if(!req.params.id || req.params.id.length != 24) {
        return res.sendStatus(400);
    }
    const id = req.params.id;
    
    const team = {};

    if(req.body.members) {
        if (!Array.isArray(req.body.members)) {
            return res.sendStatus(400);
        }
        team.members = req.body.members;
    }
    if(req.body.name) {
        team.name = req.body.name;
    }
    Teams.findByIdAndUpdate(id, team, function (err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            if (data){
                console.log(data);
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    })
}

module.exports.getTeam = function (req, res) {
    if(!req.params.id || req.params.id.length != 24) {
        return res.sendStatus(400);
    }
    const id = req.params.id;

    Teams.findById(id).then(team => {
        if (team) {
            team.populate('members').then(populated => {
                console.log(populated);
            })
            return res.sendStatus(200);
        } else {
            return res.sendStatus(404);
        }
    })
}