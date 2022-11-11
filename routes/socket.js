const passport = require('passport');
require('mongoose');
const Users = require('../schemas/schemas.js').users;

var socket_connected_users = 0;

module.exports = function(app, io) {
    register_socket(io);
    
    function post_broadcast_msg (req, res) {
        if (!req.body.message) {
            res.sendStatus(400);
            return;
        }
        if (socket_connected_users == 0) {
            res.sendStatus(404)
            return
        }
        io.emit('msg', req.body.message);
        res.sendStatus(200);
    }
    
    function get_socket_connected_count(req, res) {
        res.json({amount: socket_connected_users});
    }

    function register_socket (io) {

        io.use(function(socket, next){
            const id = socket.handshake.query.id;
            if (id.length != 24 && id.length != 12) {
                next(new Error('invalid id'));
            } else {
                Users.findOne().where('_id').in(id).then(user => {
                    if (user) {
                        next();
                    } else {
                        next(new Error('Auth Error'));
                    }
                })  
            }
        });

        io.on('connection', function(socket) {
            socket_connected_users =  socket.adapter.sids.size;
            socket.on('disconnect', function() {
                socket_connected_users =  socket.adapter.sids.size;
            })
        }) 
        
    }
    
    app.post('/api/socket/broadcast', passport.authenticate('jwt', {session: false}), post_broadcast_msg);
    app.get('/api/socket/clients', get_socket_connected_count);
}

