const log = require('log-util');
const amqp = require('amqplib/callback_api');

module.exports = class LocalSession {

    constructor(socketId, userId, io, channel) {
        this.socketId = socketId;
        this.userId = userId;
        this.io = io;

        this.startQueue = () => {
            onConnectionReady((ch) => {
                    console.log(" [*] Waiting for messages in %s.", userId);
                    channel = ch;
                    ch.assertQueue(userId, {durable: true});
                    ch.consume(userId, function (msg) {
                        console.log(" [x] Received %s", msg.content.toString());
                        const socket = io.sockets.connected[socketId];
                        if (socket) {
                            log.info(`Sending socket message`);
                            socket.emit("message", msg.content.toString(), (ack) => {
                                console.log(`Message sent`);
                                ch.ack(msg);
                                if (ack) {
                                       const jsonAck = JSON.parse(ack)
                                     ch.assertQueue(jsonAck.recipient_id, { durable: true });
                                     ch.sendToQueue(jsonAck.recipient_id, new Buffer(ack), { persistent: true });
                                }
                            })
                        } else {
                            log.warn(`Could send message socket ${userId} is undefined`)
                        }
                    }, {noAck: false,consumerTag:userId})
            })
        };

        this.closeQueue = () => {
            console.log(`Closing queue ${userId}`);
            channel.cancel(userId)
        };

        this.sendMessage = (message) => {
            const socket = io.sockets.connected[socketId];
            if (socket) socket.emit("message", JSON.stringify(message))
        }

    };
}

let channel = undefined;
const callbacks = [];


amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        channel = ch;
        while (callbacks.length > 0) {
            const callback = callbacks.shift();
            callback(ch)
        }
    });

});


function onConnectionReady(callback) {
    if (channel) {
        callback(channel)
    } else {
        callbacks.push(callback)
    }
}
