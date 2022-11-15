const Options = require('../../schemas/schemas.js').options;

module.exports.getOptions = function (req, res) {
    Options.findOne().then(result => {
        if (!result) {
            return res.sendStatus(404);
        }
        const size = result.options.length;
        if (size > 0) {
            const list = [];
            for (let i = 0; i < size; i++){
                list.push([result.options[i].name, result.options[i].value]);
            }
            res.status(200).json(Object.fromEntries(list));
        } else {
            res.sendStatus(404);
        }
    })
}

module.exports.patchOptions = async function (req, res) {
    if (Object.keys(req.body).length === 0 || Array.isArray(req.body)) {
        return res.sendStatus(400);
    }
    const obj = [];

    Object.entries(req.body).forEach(([key, value]) => {
        obj.push({name: key, value: value});
    });

    const result = await Options.updateOne({admin_id: req.user._id}, {options: obj}, { upsert: true });

    if (result.matchedCount > 0) {
        return res.sendStatus(200);
    } else if(result.upsertedCount > 0) {
        return res.sendStatus(201);
    } else {
        return res.sendStatus(404);
    }
}