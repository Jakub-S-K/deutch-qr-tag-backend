const Teams = require('../../schemas/schemas.js').teams;

module.exports.getTeams = async function (req, res) {
    const teams = await Teams.find({_admin: req.user._id})
        .select('-__v -_admin')
        .populate({path: 'members', select: '-__v -_admin'});
    
    if (!teams) {
        return res.sendStatus(404);
    }
    res.json(teams);
}