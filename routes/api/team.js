const Teams = require('../../schemas/schemas.js').teams;

module.exports.postTeam = function (req, res) {
    if (!req.body.name) {
        return res.sendStatus(400);
    }
    const newTeam = {};

    newTeam.name = req.body.name;

    if(req.body.members) {
        if (Array.isArray(req.body.members)) {
            newTeam.members = [...new Set(req.body.members)];
        }
    }

    Teams.findOne({ name: req.body.name }).then(team => {
        if (!team) {
            new Teams({
                ...newTeam
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
        team.members = [...new Set(req.body.members)];
    }
    if(req.body.name) {
        team.name = req.body.name;
    }
    if (Object.keys(team).length === 0) {
        return res.sendStatus(400);
    }
    Teams.updateOne({_id: id}, team, function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            if (result.matchedCount > 0){
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

    Teams.findById(id, '-_id -__v').then(team => {
        if (team) {
            team.populate({path: 'members', select: '-__v'}).then(populated => {
                return res.json(populated);
            })
        } else {
            return res.sendStatus(404);
        }
    })
}

module.exports.deleteTeam = function (req, res) {
    if(!req.params.id || req.params.id.length != 24) {
        return res.sendStatus(400);
    }
    const id = req.params.id;
    
    Teams.deleteOne({_id: id}).then(result => {
        if (result.deletedCount == 0) {
            return res.sendStatus(404);
        } else {
            return res.sendStatus(200);
        }
    })
}