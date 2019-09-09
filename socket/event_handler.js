const rabbitConn = require('./rabbit-conn.ts');
const groupRepo = require('../repo/group_repo.js');
let uuid = require('uuid/v4');
const log = require('log-util');
const onlineManager = require("./seen_status_manager.js")
const sessionManager = require("./session-manager");
const contactsRepo = require('../repo/contacts-repo.js');

function sendMessage(queueId, message) {
    rabbitConn.onReady((ch) => {
        log.debug(`Pushing message to queue ${queueId} message ${JSON.stringify(message)}`);
        ch.sendToQueue(queueId, new Buffer(JSON.stringify(message)), {persistent: true});
    })
}

module.exports.onEvent = (message) => {
    console.log(`onEvent ${JSON.stringify(message)}`)

    if (message.message_type === "TYPING") {
        typingMessage(message)
    }
    else if (message.message_type === "CREATE_SIGNAL_KEY_MESSAGES") {
        signalKeyMessage(message)
    } else if (message.recipient_id != null) {
        console.log("sending message to %s", message.recipient_id);
        sendMessage(message.recipient_id, message)
    }
    else if (isGroupMessage(message.conversation_id)) {
        onGroupMessage(message, false)
    }
};


async function onGroupMessage(message, sendToSender) {
    console.log("groupMessage ");
    log.debug("Fetching participants");
    const participants = await groupRepo.getParticipants(message.conversation_id)

    if (!participants) {
        log.debug("No participant found");
        return
    } else {
        log.verbose(`${participants.length} participants found`)
    }

    for (i = 0; i < participants.length; i++) {
        const participant = participants[i];

        if (participant.user_id === message.sender_id && !sendToSender)
            continue;

        rabbitConn.onReady((ch) => {
            ch.assertQueue(participant.user_id, {durable: true});
            ch.sendToQueue(participant.user_id, new Buffer(JSON.stringify(message)), {persistent: true});
        })
    }

}


function typingMessage(message) {
    if (message.recipient_id != null) {
        if (onlineManager.isOnline(message.recipient_id)) {
            let socket = sessionManager.getSession(message.recipient_id);
            if (socket) socket.sendMessage(message)
        }
    }
}

function signalKeyMessage(message) {
    console.log("SendSignalKeyMessage ");
    const keys = message.message_params.messages;
    const conversationId = message.conversation_id;
    const senderId = message.sender_id;

    keys.forEach(blazeKeyMessage => {
        const recipientId = blazeKeyMessage.recipient_id;
        const keyMessage = {
            id: message.id,
            conversation_id: conversationId,
            sender_id: senderId,
            message_type: "CHAT_MESSAGE",
            message_params: {
                message_id: blazeKeyMessage.message_id,
                data: blazeKeyMessage.data,
                category: "SIGNAL_KEY"
            },
            created_at: message.created_at
        };
        console.log("Recipient %s", recipientId);
        console.log(`Message Group key message ${JSON.stringify(keyMessage)}`);
        sendMessage(recipientId, keyMessage)
    })
}

//System conversatoin for groups 


module.exports.onRemoveOrExit = async (conversationId, senderId, participantId, type) => {
    const msg = {
        id: uuid(),
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: 'SYSTEM',
        system_data: {
            action: type,
            participant_id: participantId
        },
        created_at: new Date().toISOString()
    };

    console.log("onRemoveOrExit" + JSON.stringify(msg));
    sendMessage(participantId, msg);
    onGroupMessage(msg, true)

};


module.exports.onAdded = async (conversationId, senderId, participants) => {

    const msg = {
        id: uuid(),
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: 'SYSTEM',
        system_data: {
            action: 'ADD',
        },
        created_at: participants[0].created_at
    };
    console.log(msg);

    participants.forEach(participant => {
        msg.id = uuid();
        msg.system_data.participant_id = participant.user_id;
        onGroupMessage(msg, true)
    });
};

module.exports.onRole = async (conversationId, senderId, participantId) => {
    const msg = {
        id: uuid(),
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: 'SYSTEM',
        system_data: {
            action: "ROLE",
            role: "ADMIN",
            participant_id: participantId
        },
        created_at: new Date().toISOString()
    };
    onGroupMessage(msg, true)

};

module.exports.onConversationUpdate =  (conversationId, senderId, type) => {
    const msg = {
        id: uuid(),
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: 'SYSTEM',
        system_data: {
            action: type,
        },
        created_at: new Date().toISOString()
    };

    onGroupMessage(msg, false)
};

module.exports.profileUpdateEvent = async function (userId) {
    console.log("profileUpdateEvent");
    const event = {
        "id":uuid(),
        "sender_id":userId,
        "conversation_id":"",
        "message_type":"EVENT",
        "created_at":new Date().toISOString()
    };
    const recipients = await contactsRepo.queryUserIds(userId);
        if (recipients && recipients.length !== 0) {
            recipients.forEach(recipientId => {
            console.log("sending event to " + recipientId.user_id);
            const session= sessionManager.getSession(recipientId.user_id);
            if (!session) return;
            session.sendMessage(event);
        });
    }
};

function isGroupMessage(conversationId) {
    return conversationId.startsWith('group')
}

module.exports.onGroupMessage = onGroupMessage;
