const router = require('express').Router();
const profileRepo = require('../repo/profile-refo.js');
const s3 = require("../util/aws.js");
const eventHandler = require('../socket/event_handler.js');

router.post("/profile/me", async function (req, res) {
    const userId = req.user_id;
    console.log(`profile update ${userId}`);
    const accountUpdateRequest = req.body;
    const exist = await profileRepo.isProfileExist(userId);
    try {
        if (!exist) await profileRepo.insert(userId, accountUpdateRequest);
        else {
            await profileRepo.update(userId, accountUpdateRequest);
            eventHandler.profileUpdateEvent(userId)
        }
        console.log("Profile update success");
        res.status(200).end()
    } catch (e) {
        console.log(`Profile update error ${e}`);
        res.status(500).end()
    }
});

router.post("/profile/remove",async function (req,res) {
    const userId = req.user_id;
    try {
        await profileRepo.removeProfile(userId);
        eventHandler.profileUpdateEvent(userId);
        res.status(200).end();
    }catch (e) {
        console.log(`Profile remove error ${e}`);
        res.status(500).end()
    }
});
router.get("/avatar/:userid", async function (req, res) {
    const userId = req.params.userid;
    const account = await profileRepo.getAvatarAndThumbnail(userId)
    if (account && account.avatar && account.thumbnail) {
        const avatarKey = account.avatar
        const data = await s3.download(avatarKey)
        account.avatar = data.Body.toString("utf-8")
        res.status(200).end(JSON.stringify(account))
    } else {
        res.status(200).end("{}")
    }
});


router.get("/profiles/fetch", async function (req, res) {
    console.log("/profiles/fetch")

    const user_id = req.user_id;
    try {
        const profiles = await profileRepo.fetchProfiles(user_id);
        if (profiles) {
            res.status(200).end(JSON.stringify(profiles))
        } else {
            res.status(200).end("{}")
        }
    } catch (e) {
        console.log(e)
        res.status(500).end()
    }
})


router.post("/users/fetch", async (req, res) => {
    const userIds = req.body
    try {
        const response = await profileRepo.fetchProfiles(userIds)
        if (!response || response.length === 0) {
            res.status(200).end("[]")
            return
        }
        res.status(200).end(JSON.stringify(response))
    } catch (e) {
        console.log("/users/fetch ERROR: %s ", e)
        res.status(500).end("{}")
    }
})

router.get("/profile/:userid", async function (req, res) {
    const user_id = req.params.userid
    console.log(`fetch profile ${user_id}`)
    try {
        const profile = await profileRepo.findProfile(user_id)
        res.status(200).end(JSON.stringify(profile))
    } catch (e) {
        console.log(e)
        res.status(500).end()
    }
})


module.exports = router