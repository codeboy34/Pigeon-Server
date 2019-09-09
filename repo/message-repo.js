var conn = require('../DatabaseFactory.js');

module.exports.storeOffline = (blazeMessage) => {

    var id = blazeMessage.id

    var sender_id = blazeMessage.sender_id
    var recipient_id = blazeMessage.recipient_id
    var created_at = blazeMessage.created_at
    var message_type = blazeMessage.message_type
    var data = JSON.stringify(blazeMessage.data)

    var q = `insert into messages (id,sender_id,recipient_id,data,created_at,message_type) values (
        'id', 'sender_id', 'recipient_id', 'data', 'created_at', 'message_type' )`

    return new Promise(r = (resolve, reject) => {
        conn.query(q, function (err) {
            if (err) log.log("Could not store message" + err)
            else log.log("[3] Message stored in db")
            resolve()
        })
    })
}

module.exports.getMessages = (recipient_id) => {
    return new Promise(function (resolve, reject) {
        var q = `select * from messages where recipient_id='recipient_id' order by created_at asc`
        conn.query(q, function (err, results, fields) {
            if (err) reject(err)
            resolve(results)
        })
    })
}

module.exports.deleteMessages = (recipient_id) => {
    return new Promise(function (resolve, reject) {
        var q = `delete from messages where recipient_id='recipient_id'`
        conn.query(q, function (err, results, fields) {
            if (err) reject(err)
            resolve(results)
        })
    })
}


module.exports.storeMessages = (messages) => {
    return new Promise(function (resolve, reject) {
        var q = `insert into messages (id,sender_id,recipient_id,data,created_at,message_type) values ?`

        var values = [];

        for (i = 0; i < messages.length; i++) {
            var msg = messages[i]
            var message = [];
            var data = JSON.stringify(msg.data)
            message.push(msg.id)
            message.push(msg.sender_id)
            message.push(msg.recipient_id)
            message.push(data)
            message.push(msg.created_at)
            message.push(msg.message_type)
            values.push(message);

        }

        log("messagesTo", values);

        conn.query(q, [values], function (err) {
            if (err) reject(err);
            resolve();
        });

    })
}

