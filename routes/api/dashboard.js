const Teams = require('../../schemas/schemas.js').teams;
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

module.exports.getDashboard = function (req, res) {
    res.json(hardcoded);
}

const hardcoded = [
    {
        "_id": "636aa6c7c61bfc26701d265e",
        "name": "test team patch",
        "members": [
            {
                "_id": "636be5704ec9386663972cf6",
                "name": "Adam",
                "surname": "Kowalew"
            },
            {
                "_id": "636bf62b25698b7989a6b5d1",
                "name": "Marian",
                "surname": "Niedzielski"
            }
        ]
    },
    {
        "_id": "639e620448efa66d12673b19",
        "name": "test team patch",
        "members": [
            {
                "_id": "636bfcbef351cebeee9fcdfd",
                "name": "Jonatan",
                "surname": "Alwrecht"
            }
        ]
    },
    {
        "_id": "639f147093183cc7edd3aa01",
        "name": "Grzeczne chłopoki",
        "members": [
            {
                "_id": "636bfe17f351cebeee9fce0b",
                "name": "Marian",
                "surname": "Bębnicki"
            }
        ]
    },
    {
        "_id": "639f18ff47790319567d6522",
        "name": "niechaj będzie kremowski i łakomy",
        "members": [
            {
                "_id": "636bf69f25698b7989a6b5dd",
                "name": "Jan",
                "surname": "Kremowski"
            },
            {
                "_id": "636bf6f4f351cebeee9fbabd",
                "name": "Julisz",
                "surname": "Łakomy"
            }
        ]
    },
    {
        "_id": "639f1dd802c912090388eddd",
        "name": "brr",
        "members": [
            {
                "_id": "636bfcb2f351cebeee9fcdf6",
                "name": "Albert",
                "surname": "Michałowski"
            },
            {
                "_id": "636bfdf7f351cebeee9fce04",
                "name": "Jozajasz",
                "surname": "Wierchucki"
            },
            {
                "_id": "636bfa53f351cebeee9fcdef",
                "name": "Jan",
                "surname": "Kowalski"
            }
        ]
    }
]