require('mongoose');
const Users = require('../../schemas/schemas.js').users;
const Teams = require('../../schemas/schemas.js').teams;

module.exports.get = function (req, res) {
    Users.find({_admin: req.user._id}).select('-__v').sort().then(users => {
        if (users) {
            res.json(users)
        } else {
            res.sendStatus(404);
        }
    });
}

module.exports.getFree = async function (req, res) {
    let allUsers = Users.find({_admin: req.user._id}).select('-__v -_admin').lean();
    let teams = Teams.aggregate([
        {
          '$match': {
            '_admin': req.user._id
          }
        },
        {
            '$replaceWith': {
                'members': '$members'
            }
        },
        {
            '$unwind': {
                'path': '$members',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            '$group': {
                '_id': '0',
                'members': {
                    '$push': '$members'
                }
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'let': {},
                'pipeline': [
                    {
                        '$match': {_admin: req.user._id}
                    }
                ],
                'as': 'users'
            }
        }, {
            '$unwind': {
                'path': '$users'
            }
        }, {
            '$group': {
                '_id': '0',
                'members': {
                    '$first': '$members'
                },
                'users': {
                    '$push': '$users._id'
                }
            }
        }, {
            '$addFields': {
                'empty': {
                    '$setDifference': ['$users', '$members']
                }
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'empty',
                'foreignField': '_id',
                'pipeline': [
                    {'$project': {
                        'name': 1,
                        'surname': 1
                    }}
                ],
                'as': 'users'
            }
        }, {
            '$project': {
                'users': 1,
                '_id': 0
            }
        }
    ]).exec();


    [allUsers, teams] = await Promise.all([allUsers, teams]);
    
    if (teams.length === 0) {
        return res.json(allUsers);
    }

    return res.json(teams[0].users);

}
