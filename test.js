var time = new Date().getTime() - 30 \ * 24 \ * 60 \ * 60 \ * 1000;

isd.aggregate([
    {
        $match: {
            created: {
                $gt: new Date(time)
            }
        }
    }, {
        $group: {
            _id: null,
            count: {
                $sum: 1
            }
        }
    }
], function (err, result) {
    if (err) {
        next(err);
    } else {
        res.json(result);
    }
});
