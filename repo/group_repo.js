const conn = require("../database_factory.js");

module.exports.create = (conversation_id, name, thumbnail, iconKey, created_at, creatorId) => {
    return new Promise((resolve, reject) => {
        console.log(`Creating group ${conversation_id},${name},${created_at}`)

        const q = `insert into groups (conversation_id,name,created_at,creator_id,thumbnail,icon_key) VALUES ('${conversation_id}',
        '${name}','${created_at}','${creatorId}','${thumbnail}','${iconKey}' )`
        conn.query(q, (err) => {
            if (err) throw reject(err)
            resolve()
        })
    })
}

module.exports.getParticipants = (conversationId) => {
    return new Promise((resolve, reject) => {
        const q = `select * from participants where conversation_id='${conversationId}'`

        conn.query(q, (err, results) => {
            if (err) reject(err)
            resolve(results)
        })
    })
}

module.exports.getConversation = (conversationId) => {
    return new Promise((resolve, reject) => {
        const q = `select conversation_id,name,thumbnail,created_at,creator_id from groups where conversation_id='${conversationId}'`
        conn.query(q, (err, results) => {
            if (err) reject(err)
            resolve(results)
        })
    })
}


module.exports.addParticipants = (conversationId, participantsList) => {
    return new Promise((resolve, reject) => {
        console.log("adding participants")
        const q = `insert into participants (conversation_id, user_id, role)
                   VALUES ?`;
        const participants = [];
        participantsList.forEach(participant => {
            const newParticipant = [];
            newParticipant.push(conversationId)
            newParticipant.push(participant.user_id)
            newParticipant.push(participant.role)
            participants.push(newParticipant)
        });

        conn.query(q, [participants], function (err) {
            if (err) throw reject(err)
            resolve()
        })
    })
}

module.exports.removeParticipant = (conversationId, participantId) => {
    return new Promise((resolve, reject) => {
        const q = `delete from participants where user_id='${participantId}' AND conversation_id='${conversationId}'`;
        conn.query(q, (err) => {
            if (err) reject(err)
            resolve()
        })
    })
}

module.exports.update = (conversationId, name, avatarKey = null, thumbnail = null) => {
    return new Promise((resolve, reject) => {
        let q = "UPDATE groups set  "
        if (name) q = `${q} name='${name}'`;
        else if (avatarKey != null && thumbnail != null) q = `${q} icon_key = '${avatarKey}', thumbnail = '${thumbnail}'`;
        q = `${q} where conversation_id = '${conversationId}'`

        console.log(`Conversation update query ${q}`)
        conn.query(q, err => {
            if (err) reject(err);
            resolve()
        })
    })
}

module.exports.updateRole = (conversationId, participantId) => {
    return new Promise((resolve, reject) => {
        const q = `UPDATE participants set role='ADMIN' where user_id='${participantId}' AND conversation_id='${conversationId}'`;
        conn.query(q, (err) => {
            if (err) reject(err)
            resolve()
        })
    })
}

module.exports.iconThumbnailAndKey = conversationId => {
    return new Promise((resolve, reject) => {
        const q = `select thumbnail, icon_key from groups where conversation_id ='${conversationId}'`;
        console.log("iconThumbnailAndKey query %s", q);
        conn.query(q, (err, results) => {
            console.log("Response %s ", JSON.stringify(results));
            if (err) reject(err);
            resolve(results)
        })
    })
};

module.exports.getConversationName = conversationId => {
    return new Promise((resolve, reject) => {
        const q = `select name from groups where conversation_id='${conversationId}'`
        conn.query(q, (err, results) => {
            if (err) reject(err)
            resolve()
        })
    })
};