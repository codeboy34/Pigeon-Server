const router = require('express').Router()
const settingRepo = require("../repo/setting_repo")

router.post("/settings", (req, res) => {
    const request = req.body;
    const userId = req.user_id;

    try {
        if (request.profile) {
            settingRepo.updateProfileAccessSetting(userId, request.profile)
        }
        else if (request.seen) {
            settingRepo.updateSeenAccessSetting(userId, request.seen)
        }
        res.status(200).end()
    } catch (e) {
        res.status(500).end()
    }

})

module.exports = router;