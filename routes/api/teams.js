const Teams = require('../../schemas/schemas.js').teams;

module.exports.getTeams = async function (req, res) {
    const teams = await Teams.find().select('-_id -__v').populate({path: 'members', select: '-__v'});
    
    if (!teams) {
        return res.sendStatus(404);
    }

    res.json(teams);
}