const Options = require('../../schemas/schemas.js').options;

module.exports.getOptions = function (req, res) {
    Options.find().then(result => {
        if (result.length > 0) {
            res.json(result);
        } else {
            res.sendStatus(404);
        }
    })
}

module.exports.patchOptions = function (req, res) {
    if (Object.keys(req.body).length === 0 || Array.isArray(req.body)) {
        return res.sendStatus(400);
    }

    const dbTransactions = [];

    Object.entries(req.body).forEach(([key, value]) => {
        console.log('element: ', key, value);
        dbTransactions.push(new Promise(resolve => {
            Options.updateOne({ name: key }, { value: value }, function (err, result) {
                if (err) {
                    console.log('error', err);
                    resolve(400);
                } else {
                    if (result.acknowledged && result.matchedCount > 0) {
                        resolve(200);
                    } else {
                        resolve(404);
                    }
                }
            })
        }))
    });
    Promise.all(dbTransactions).then(result => {
            const status = result.every(code => {
                if (code !== 200) {
                    res.sendStatus(code);
                    return false;
                } else {
                    return true;
                }
            })
            if (status) {
                return res.sendStatus(200);
            }
        }
    )
}