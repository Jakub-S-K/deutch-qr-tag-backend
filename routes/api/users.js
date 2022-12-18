require('mongoose');
const Users = require('../../schemas/schemas.js').users;
const Teams = require('../../schemas/schemas.js').teams;

module.exports.get = function(req, res) {
    Users.find().select('-__v').sort().then(users => {
        if (users) {
            res.json(users)
        } else {
            res.sendStatus(404);
        }
    });
}

module.exports.getFree = function(req, res) {

    Teams.aggregate([
        {
          '$replaceWith': {
            'members': '$members'
          }
        }, {
          '$unwind': {
            'path': '$members', 
            'preserveNullAndEmptyArrays': false
          }
        }, {
          '$group': {
            '_id': '0', 
            'members': {
              '$push': '$members'
            }
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'let': {}, 
            'pipeline': [
              {
                '$match': {}
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
              '$setDifference': [
                '$users', '$members'
              ]
            }
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'empty', 
            'foreignField': '_id', 
            'as': 'users'
          }
        }, {
          '$project': {
            'users': 1, 
            '_id': 0
          }
        }
      ]).then(teams => {
        if (teams) {
            return res.json(teams[0]);
        } else {
            return res.sendStatus(404)
        }
    })

    // Teams.find().select('-_id -__v').populate({path: 'members', select: '-__v'}).then(teams => {
    //     console.log(teams);
    //     if (teams) {
    //         return res.json(teams);
    //     } else {
    //         return res.sendStatus(404);
    //     }
    // })
}