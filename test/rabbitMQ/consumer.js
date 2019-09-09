var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    if (err) {
        console.log(`Error ${err}`);
        return
    }
    conn.createChannel(function (err, channel) {
        console.log("channel is Ready")
        channel.assertQueue("test", {durable: true});
        channel.prefetch(1);

        let consumerTag = "tag"
        channel.consume("test", function (msg) {

            console.log(" [x] Received %s", msg.content.toString());
            setTimeout(() => {
                console.log("ack  %s", msg)
                channel.ack(msg)
            }, 100)

        }, {noAck: false, consumerTag: consumerTag});

        //console.log("TAG %s",JSON.stringify(tag))
        setTimeout(() => {
            console.log("Canceling Queue %s",consumerTag);
            channel.cancel(consumerTag,()=>{
                console.log("Cancelled")
            })
        }, 2000)
    })
})