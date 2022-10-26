const passport = require('passport');

var socket_connected_users = 0;

module.exports = function(app, io) {
    register_socket(io);
    
    function post_broadcast_msg (req, res) {
        if (!req.body.message) {
            res.status(400).json({message: 'Invalid request format'});
            return;
        }
        if (socket_connected_users == 0) {
            res.status(404).json({message: 'There are no connected clients'})
            return
        }
        io.emit('msg', req.body.message);
        res.sendStatus(200);
    }
    
    function get_socket_connected_count(req, res) {
        router.get('/socket/amount', (req, res) => {
            res.json({amount: socket_connected_users});
        });
    }

    function register_socket (io) {
        io
        .on('connection', function(socket) {
            socket_connected_users =  socket.adapter.sids.size;
            socket.on('disconnect', function() {
                socket_connected_users =  socket.adapter.sids.size;
            })
        }) 
    }
    

    app.post('/socket/broadcast', passport.authenticate('jwt', {session: false}), post_broadcast_msg);
    app.get('/socket/clients', get_socket_connected_count);
}

