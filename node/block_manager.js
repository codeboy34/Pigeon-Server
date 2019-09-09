const router = require("express").Router();
const blockRepo = require("../repo/block_repo.js");

router.post("/user/:userid/block", async (req, res) => {
    console.log("/user/block");
    const userId = req.user_id;
    const blockUserId = req.params.userid;

    try {
        await blockRepo.block(userId, blockUserId);
        res.status(200).end()
    } catch (e) {
        console.log("/user/block Error %s", e);
        res.status(500).end()
    }
});

router.post("/user/:userid/unblock", async (req, res) => {
    const userId = req.user_id;
    const blockUserId = req.params.userid
    try {
        await blockRepo.unblock(userId, blockUserId);
        res.status(200).end()
    } catch (e) {
        res.status(500).end()
    }
});


router.post("/blocklist", async (req, res) => {
    const userId = req.user_id
    try {
        const blockList = await blockRepo.blockList(userId)
        if (blockList && blockList.length > 0) res.status(200).end(JSON.stringify(blockList))
        else res.status(200).end("[]")
    } catch (e) {

    }
});

module.exports = router