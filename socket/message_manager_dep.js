
var userManager = require('./UserManager.js')
var socketEvents = require('../SocketEvents.js')
var conn = require('../database_factory.js');
var Log = require("../util/logutil.js")
log = new Log("MessageManager")
var contactsRepo = require('../repo/contacts-repo.js')
var rabbitConn = require('../rabbiMQ/rabbit-conn.ts')

//hold the message with msg_id key
var messageQue = {}


var io

function setIO(_io) {
    io = _io
}

var msg = "The definite article is the word the. It limits the meaning of a noun to one particular thing. For example, your friend might ask, “Are you going to the party this weekend?” The definite article tells you that your friend is referring to a specific party that both of you know about. The definite article can be used with singular, plural, or uncountable nouns. Below are some examples of the definite article the used in "

function messageEvent(message) {

    rabbitConn.onReady((ch) => {

        ch.assertQueue("8094772915", { durable: true });
        // ch.sendToQueue(message.recipient_id, new Buffer(msg), { persistent: true });
        // ch.sendToQueue(message.recipient_id, new Buffer(msg), { persistent: true });

        for (i = 0; i < 10; i++) {
            ch.sendToQueue("8094772915", new Buffer(i + " " + 1 + msg), { persistent: true });
            ch.sendToQueue("8094772915", new Buffer(i + " " + 2 + msg), { persistent: true });
            ch.sendToQueue("8094772915", new Buffer(i + " " + 3 + msg), { persistent: true });
            ch.sendToQueue("8094772915", new Buffer(JSON.stringify(i + " " + 4 + message)), { persistent: true });
        }
    })
}




async function onMessage(msg) {


    var receiver = msg.recipient_id
    var sender = msg.sender_id

    log.log(" [#][1] message from " + sender + " to " + receiver + " ")
    console.log("============\n" + JSON.stringify(msg) + "\n==============")


    if (msg.message_type == 'EVENT') {
        onEventMessage(msg)
        return
    }

    log.log("[2]Saving message offline")


    await storeOffline(msg)

    log.log("[4]Message saved")

    startMessageQueue(receiver)

}


async function onEventMessage(blazeMessage) {

    console.log("onEventMessage")

    var sender_id = blazeMessage.sender_id
    var recipient_ids = await contactsRepo.queryUserIds(sender_id)
    console.log(JSON.stringify(recipient_ids))

    if (recipient_ids && recipient_ids.length != 0) {
        recipient_ids.forEach(recipient_id => {

            console.log("sending event to " + recipient_id.user_id)
            if (!userManager.isUserAuthenticated(recipient_id.user_id))
                return

            var socketId = userManager.getSocketId(recipient_id.user_id)
            var socket = io.sockets.connected[socketId]
            if (socket) {
                console.log("socket is connected sending event")
                socket.emit("message", blazeMessage)
            }
        });
    }
}


function startMessageQueue(receiver) {
    if (userManager.isUserAuthenticated(receiver)) {

        log.log("[5] " + receiver + " is authenticated.")

        var socketId = userManager.getSocketId(receiver);

        if (!socketId) {
            console.log("socket Id undefined")
        }

        else if (!io.sockets.connected[socketId])
            console.log("socket undefined.")

        if (socketId && io.sockets.connected[socketId]) {
            var msgJob = messageQue[receiver]
            if (!msgJob) {
                log.start("[$][6] Queue is not running")
                log.start("[$][7] Starting queue...")
                var job = new MessageJob(receiver, socketId)
                messageQue[receiver] = job
                job.process()
            } else {
                log.log("[$] Queue is already running")
            }
        } else { log.log("Socket undefined.Could not proccess Queue") }
    } else {
        log.log(receiver + " is not authenticated. So don't start queue.")
    }
}

function onConnected(receiver) {


    log.log("connected " + receiver)

    if (messageQue[receiver])
        delete messageQue[receiver]

    startMessageQueue(receiver)

}


function onDisconnected(user_id) {
    if (messageQue[user_id])
        delete messageQue[user_id]
}


function sendSentStatus(socketId, ack, io) {

    if (io.sockets.connected[socketId]) {
        console.log("Sending sent ack")
        io.sockets.connected[socketId].emit(socketEvents.MSG_STATUS, ack)
    } else {
        //store status offline
        console.log("Saving ack")

    }
}


function getOfflineMessages(receiver) {
    console.log("getOfflineMessagesFromDb()")
    return new Promise(function (resolve, reject) {
        var q = "select * from messages where receiver=" + receiver
        conn.query(q, function (err, results, fields) {
            if (err) reject(err)
            if (!results) {
                console.log("No offline message found")
                resolve([])
            }
            else {
                console.log(results.size, "messagesFound")
                resolve(results)
            }

        })
    })
}

function getMessage(recipient_id) {
    return new Promise(function (resolve, reject) {
        var q = "select * from messages where recipient_id=" + recipient_id + " order by created_at asc limit 1"
        conn.query(q, function (err, results, fields) {
            if (err) reject(err)

            if (!results) {
                log.log("No offline message found")
                resolve(null)
            }
            else {
                resolve(results[0])
            }

        })
    })
}

function deleteMessage(msgId) {

    conn.query("delete from messages where id ='" + msgId + "'")
}

function storeOffline(blazeMessage) {

    var id = blazeMessage.id

    var sender_id = blazeMessage.sender_id
    var recipient_id = blazeMessage.recipient_id
    var created_at = blazeMessage.created_at
    var message_type = blazeMessage.message_type
    var data = JSON.stringify(blazeMessage.data)

    var q = "insert into messages (id,sender_id,recipient_id,data,created_at,message_type) values ('" +
        id + "','" + sender_id + "','" + recipient_id + "','" + data + "','" + created_at + "','" + message_type + "')"

    return new Promise(r = (resolve, reject) => {
        conn.query(q, function (err) {
            if (err) log.log("Could not store message" + err)
            else log.log("[3] Message stored in db")
            resolve(true)
        })
    })
}


class MessageJob {
    constructor(receiver, socketId) {
        this.receiver = receiver
        this.socketId = socketId
        this.self = this

        this.process = async () => {
            var msg = await getMessage(receiver)

            if (!msg) log.log("No message to send.")

            if (msg && io.sockets.connected[socketId]) {
                io.sockets.connected[socketId].emit("message", msg, (ack) => {
                    if (!ack) {
                        deleteMessage(msg.id)
                        return
                    }
                    console.log(ack)
                    log.log("[8] Ack " + ack.id)
                    deleteMessage(ack.id)

                    log.log("message deleted.")

                    log.log("sending delivered")

                    onMessage(ack)
                    if (this.timeout) {
                        clearTimeout(this.timeout)
                        this.timeout = null
                    }
                    this.process()
                })

                this.timeout = setTimeout(function () {
                    this.process()
                }.bind(this), 5000)

            } else {
                log.log("Deleting queue")
                delete messageQue[receiver]
            }
        }
    }
}


module.exports = {
    messageEvent: messageEvent,
    onMessage: onMessage,
    setIO: setIO,
    onConnected: onConnected,
    onDisconnected: onDisconnected
}