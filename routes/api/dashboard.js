const Teams = require('../../schemas/schemas.js').teams;
const Answers = require('../../schemas/schemas.js').answers;
const liveUsers = require('./mobile/heartbeat.js').users;

module.exports.getLiveUsers = async function (req, res) {
    let result = await Teams.find({_admin: req.user._id}).select('_id name').populate({ path: 'members', select: '_id' }).lean();

    const connTeams = [];
    for (let i = 0; i < result.length; ++i) {
        let activeUsersInTeam = 0;
        for (let j = 0; j < result[i]['members'].length; ++j) {
            if (Date.now() - liveUsers[result[i]['members'][j]['_id']] <= 20000) {
                activeUsersInTeam++;
            }
        }
        connTeams.push({_id: result[i]['_id'], count: activeUsersInTeam, membersCount: result[i]['members'].length});
    }
    return res.json(connTeams);
}

module.exports.getDashboard = async function (req, res) {
    const p_usersOnline = localLiveUsers(req, res);
    const p_result = Answers.aggregate([
        {
          '$group': {
            '_id': '$team_id', 
            'points': {
              '$sum': '$correct'
            }
          }
        }, {
          '$sort': {
            'points': -1
          }
        }, {
          '$lookup': {
            'from': 'teams', 
            'localField': '_id', 
            'foreignField': '_id', 
            'pipeline': [
              {
                '$project': {
                  'members': 0, 
                  '_admin': 0, 
                  '_id': 0, 
                  '__v': 0
                }
              }
            ], 
            'as': 'team'
          }
        }, {
          '$unwind': {
            'path': '$team'
          }
        }, {
          '$project': {
            'points': 1, 
            'team': '$team.name'
          }
        }
      ]).exec();
    let [[usersOnline, allTeams], result] = await Promise.all([p_usersOnline, p_result]);
    for (let i = 0; i < result.length; ++i) {
        const index = usersOnline.findIndex((obj) => {return obj._id === result[i]._id.toString()});
        if (index !== -1) {
            result[i]['count'] = usersOnline[index].count;
            result[i]['membersCount'] = usersOnline[index].membersCount;
        }
    }

    for (let i = 0; i < usersOnline.length; i++) {
      const index = result.findIndex((obj) => {
        return obj._id.toString() === allTeams[i]._id.toString()
      });

      if (index === -1) {
          allTeams[i].membersCount = allTeams[i].members.length;
          allTeams[i].count = 0;
          allTeams[i].points = 0;
          delete allTeams[i].members;
          allTeams[i].team = allTeams[i].name;
          delete allTeams[i].name;
          result.push(allTeams[i]);
        }
    }
    res.json(result);
}

async function localLiveUsers(req, res) {
    let result = await Teams.find({_admin: req.user._id}).select('_id name').populate({ path: 'members', select: '_id' }).lean();

    const connTeams = [];
    for (let i = 0; i < result.length; ++i) {
        let activeUsersInTeam = 0;
        for (let j = 0; j < result[i]['members'].length; ++j) {
            if (Date.now() - liveUsers[result[i]['members'][j]['_id']] <= 20000) {
                activeUsersInTeam++;
            }
        }
        connTeams.push({_id: result[i]['_id'].toString(), count: activeUsersInTeam, membersCount: result[i]['members'].length});
    }
    return [connTeams, result];
}