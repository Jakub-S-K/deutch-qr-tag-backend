const live_users = {};

module.exports.users = live_users;

module.exports.postheartbeat = function (req, res) {
    const id = req.body.user_id;

    if (!id){
        return res.sendStatus(400);
    }
    console.log(id);
    live_users[id] = Date.now();

    return res.sendStatus(200);
}