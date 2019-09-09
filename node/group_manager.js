const router = require('express').Router();
const groupRepo = require('../repo/group_repo.js');
const msgEventHandler = require('../socket/event_handler.js');
const uuid = require('uuid/v4');
const s3 = require('../util/aws.js')
const utils = require("../util/utils.js")


//Create new conversation
router.post("/conversations", async (req, res) => {
    try {
        const ownerId = req.user_id;
        const request = req.body;
        console.log(`./conversations ${JSON.stringify(request)}`)
        let iconKey = null
        let thumbnail = null

        if (request.icon && request.thumbnail) {
            iconKey = utils.generateAvatarKey()
            await s3.uploadToS3(request.icon, iconKey)
            thumbnail = request.thumbnail
        }

        await groupRepo.create(request.conversation_id, request.name, thumbnail, iconKey, request.created_at, ownerId)
        await groupRepo.addParticipants(request.conversation_id, request.participants)
        console.log("Group created")
        res.status(201).end("{}")

        const msg = {
            id: uuid(),
            conversation_id: request.conversation_id,
            sender_id: ownerId,
            message_type: 'SYSTEM',
            system_data: {
                action: "CREATE",
                user_id: ownerId
            },
            created_at: request.created_at
        };
        msgEventHandler.onGroupMessage(msg, true)

    } catch (e) {
        res.status(500).end("{}")
        console.log(`/create ${e}`)
    }

})

//Update conversation. eg. NAME,ICON
router.post("/conversations/:id", async (req, res) => {
    const request = req.body;
    const conversationId = req.params.id
    const senderId = req.user_id
    let type
    console.log(`/conversations/:id  ${JSON.stringify(request)}`)

    try {
        if (request.name) {
            await groupRepo.update(conversationId, request.name)
            type = "UPDATE_NAME"
        }
        else if (request.thumbnail && request.icon) {
            const avatarKey = utils.generateAvatarKey()
            await s3.uploadToS3(request.icon, avatarKey)
            await groupRepo.update(conversationId, null, avatarKey, request.thumbnail)
            console.log("Updated")
            type = "UPDATE_ICON"
        }
        res.status(200).end("{}")
        msgEventHandler.onConversationUpdate(conversationId, senderId, type)
    } catch (e) {
        console.log(`/conversations/:id ${e}`)
        res.status(500).end("{}")
    }
})

//ADD new participants
router.post("/conversations/:id/participants/ADD", async (req, res) => {
    try {
        const senderId = req.user_id;
        const conversationId = req.params.id;
        const participants = req.body;
        console.log("/add " + JSON.stringify(participants))
        await groupRepo.addParticipants(conversationId, participants)

        res.status(200).end("{}")
        msgEventHandler.onAdded(conversationId, senderId, participants)
        console.log("Added")

    } catch (e) {
        res.status(500).end("{}")
        console.log(`/create ${e}`)
    }
})

//REMOVE participants
router.post("/conversations/:id/participants/REMOVE", async (req, res) => {
    const senderId = req.user_id;
    console.log(`conversations/participants/REMOVE`)
    const conversationId = req.params.id;
    const request = req.body;
    const participant = request[0];
    const createdAt = participant.created_at;
    const userId = participant.user_id;

    console.log(`body ${JSON.stringify(request)}`)

    try {
        await groupRepo.removeParticipant(conversationId, userId)
        console.log("removed")
        res.status(200).end("{}")
        msgEventHandler.onRemoveOrExit(conversationId, senderId, userId, 'REMOVE', createdAt)

    } catch (e) {
        console.log(`Removing err ${e}`)
        res.status(500).end("{}")
    }
})

//Add ROLE
router.post("/conversations/:id/participants/ROLE", async (req, res) => {
    const senderId = req.user_id;
    console.log(`conversations/participants/ROLE`)
    const conversationId = req.params.id;
    const request = req.body;
    const participant = request[0];
    const createdAt = participant.created_at;
    const userId = participant.user_id;

    console.log(`body ${JSON.stringify(request)}`)

    try {
        await groupRepo.updateRole(conversationId, userId)
        console.log("Role updated")
        res.status(200).end("{}")
        msgEventHandler.onRole(conversationId, senderId, userId, 'REMOVE', createdAt)

    } catch (e) {
        console.log(`Removing err ${e}`)
        res.status(500).end("{}")
    }
})

//LEAVE THE GROUP
router.post("/conversations/:id/exit", async (req, res) => {
    const conversationId = req.params.id;
    const userId = req.user_id;

    try {
        await groupRepo.removeParticipant(conversationId, userId)
        msgEventHandler.onRemoveOrExit(conversationId, userId, userId, "EXIT", new Date().toISOString())
        res.status(200).end("{}")
    } catch (e) {
        res.status(500).end("{}")
        console.log(`Group leaving error ${e}`)
    }

})

//GET CONVERSATION TO SYNC
router.get("/conversations/:id", async (req, res) => {
    try {
        const conversationId = req.params.id
        console.log(`/conversations ${conversationId}`)

        const conResult = await groupRepo.getConversation(conversationId)
        if (conResult && conResult[0]) {
            const conversation = conResult[0];
            conversation.participants = await groupRepo.getParticipants(conversationId);
            console.log(`response ${JSON.stringify(conversation)}`)
            res.status(200).end(JSON.stringify(conversation))
        } else res.status(404).end("{}")
    } catch (e) {
        console.log(`("/conversations/${conversationId} ex ${e}`)
    }
})


//GET CONVERSATION TO SYNC WITHOUT PARTICIPANTS
router.get("/conversation/:id", async (req, res) => {
    try {
        const conversationId = req.params.id
        console.log(`/conversations ${conversationId}`)

        const conResult = await groupRepo.getConversation(conversationId)
        if (conResult && conResult[0]) {
            const conversation = conResult[0];
            console.log(`response ${JSON.stringify(conversation)}`)
            res.status(200).end(JSON.stringify(conversation))
        } else res.status(404).end("{}")
    } catch (e) {
        console.log(`("/conversation/${conversationId} ex ${e}`)
    }
})


//FETCH THE GROUP ICON
router.get("/conversation/icon/:id", async (req, res) => {
    const conversationId = req.params.id;
    console.log("CONVERSATION ID %s" ,conversationId)
    const response = {};
    try {
        const results =await groupRepo.iconThumbnailAndKey(conversationId);
        console.log(`group icon response ${JSON.stringify(results)}`);

        if (results && results[0] && results[0].thumbnail && results[0].icon_key) {
            const result = results[0];
            const data = await s3.download(result.icon_key)
            response.icon = data.Body.toString("utf-8")
            response.thumbnail = result.thumbnail;

            res.status(200).end(JSON.stringify(response))
        } else {
            res.status(200).end(JSON.stringify(response))
        }
    } catch (e) {
        console.log(" Exception : /conversation/icon/:id %s", e)
    }
})
module.exports = router

//FETCH GROUP NAME
router.get("/conversation/name/:id", async (req, res) => {
    const conversationId = req.params.id
    try {
        const results = groupRepo.getConversationName(conversationId)
        if (results && results[0]) {
            res.status(200).end(JSON.stringify(results[0]))
        } else {
            res.status(200).end("{}")
        }
    } catch (e) {
        res.status(500).end("{}")
    }
})
