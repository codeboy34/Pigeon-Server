var amqp = require('amqplib/callback_api');


amqp.connect('amqp://localhost', function (err, conn) {
    if (err) {
        console.log(`Error ${err}`);
        return
    }
    conn.createChannel(function (err, ch) {
        if (err) {
            console.log("Channel create err " + err);
            return
        }
        var q = 'test';
        ch.assertQueue(q, {durable: true});
        // Note: on Node 6 Buffer.from(msg) should be used

        let counter = 1;

        let interval =setInterval(() => {
                ch.sendToQueue(q, new Buffer('Hello World!' + counter), {persistent: true});
                counter++
            }, 500);


    });
});
