const amqp = require('amqplib/callback_api');

let channel = undefined;
const callbacks = [];

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        console.log("channel created");
        channel = ch;
        while (callbacks.length > 0) {
            const callback = callbacks.shift();
            callback(ch)
        }
    })
});


module.exports.onReady = function onReady(callback) {
    if (channel) {
        callback(channel)
    } else {
        callbacks.push(callback)
    }
};
