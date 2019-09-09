const socketIo = require('socket.io');
const server = require('../index.js');
const tokenVerifier = require('../auth/firebase-auth');
const eventHandler = require("./event_handler.js");
const sessionManager = require('./session-manager.js');
const seenStatusManager = require('./seen_status_manager.js')
const seenRepo = require("../repo/last_seen_repo.js")
const io = socketIo(server, {pingInterval: 5000, pingTimeout: 3000});


io.use(function (socket, next) {
    const token = socket.handshake.query.token
    try {
        tokenVerifier.verifyWithToken(token, "")
        next()
    } catch (e) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', function (socket) {

    sessionManager.addSession(socket.id, socket.handshake.query.user_id, io);
    socket.user_id = socket.handshake.query.user_id;

    socket.on("disconnect", function () {
        let userId = socket.user_id;
        sessionManager.removeSession(userId);

        if (seenStatusManager.isOnline(socket.user_id)) {
            io.to(socket.user_id).emit("seenStatus", {
                "user_id": socket.user_id,
                "online": false,
                "last_seen": new Date().toISOString()
            });
        }
        seenStatusManager.removeOnline(socket.user_id)
    });

    socket.on("message", function (msg, callback) {
        callback();
        eventHandler.onEvent(msg)
    });

    socket.on("seenStatus", async function (user) {
        console.log("activeStatus %s", user.user_id);

        socket.join(user.user_id);
        if (seenStatusManager.isOnline(user.user_id)) {
            socket.emit("seenStatus", {"user_id": user.user_id, "online": true})
        } else {
            console.log("User is not online sending last seen timestamp...");
            try {
                const lastSeen = await seenRepo.getLastSeen(user.user_id);
                if (lastSeen && lastSeen[0]) {
                    console.log("LAST SEEN FOUND %s ", lastSeen[0].timestamp);
                    socket.emit("seenStatus", {
                        "user_id": socket.user_id,
                        "online": false,
                        "last_seen": lastSeen[0].timestamp
                    })
                }
            } catch (e) {
                console.log("/seenStatus %s", e)
            }
        }
    });

    socket.on("exitStatus", function (user) {
        socket.leave(user.user_id, () => {
        })
    });

    socket.on("goOnline", function () {
        console.log("%s is Online ", socket.user_id);
        seenStatusManager.addOnline(socket.user_id);
        if (seenStatusManager.isOnline(socket.user_id)) {
            io.to(socket.user_id).emit("seenStatus", {
                "user_id": socket.user_id,
                "online": true
            });
        }
    });

    socket.on("goOffline", function () {
        console.log("%s is Offline ", socket.user_id)
        seenStatusManager.removeOnline(socket.user_id);
        if (seenStatusManager.isOnline(socket.user_id)) {
            io.to(socket.user_id).emit("seenStatus", {
                "user_id": socket.user_id,
                "online": false,
                "last_seen": new Date().toISOString()
            });
        }
    })

});



