const router = require('express').Router();
const signalRepo = require('../repo/signal_repo.js');

router.post('/signal/keys', async (req, res) => {
    const userId = req.user_id;
    console.log(`userId ${userId}`);
    const keyRequest = req.body;

    try {
        console.log("push keys..");
        if (keyRequest.identity_key) {
            await signalRepo.pushKeys(userId, keyRequest);
            console.log("pushing key success")
        }
        const preKeys = keyRequest.one_time_pre_keys
        if (preKeys) {
            console.log("pushing prekey's")
            await signalRepo.deletePreKeys(userId);
            await signalRepo.pushPreKeys(userId, preKeys)
            console.log("preKeys success")
        }
        res.status(200).end()
    } catch (e) {
        console.log("/keys POST" + e);
        res.status(500).end()
    }
});

router.get("/signal/keys/:userid", async (req, res) => {
    const userId = req.params.userid
    console.log(`/signal/keys/:userid ${userId}`)
    try {
        const results = await signalRepo.consumePreKeyBundle(userId);
         if (!results || results.length === 0){ console.log("PreKeyBundle is not available..."); res.status(200).end("[]"); return }
         console.log(`Results ${results}`)
        const bundle = results[0];
        console.log(JSON.stringify(bundle))
        const signalKey = {
            user_id: userId,
            registration_id: bundle.registration_id,
            identity_key: bundle.identity_key,
            signed_pre_key: {
                signature: bundle.signature,
                key_id: bundle.skeyId,
                pub_key: bundle.spk
            },
            one_time_pre_key: {
                key_id: bundle.pKeyId,
                pub_key: bundle.ppk
            }
        };
        res.status(200).end(`[${JSON.stringify(signalKey)}]`)
        signalRepo.deletePreKey(userId, bundle.pKeyId)
    } catch (e) {
        console.log(`/keys GET ERROR ${e}`)
        res.status(500).end("{}")
    }
});

router.post('/prekeybundle/fetch', async (req, res) => {
    const body = req.body;

    console.log("/prekeybundle/fetch" ;

    const userList =[];
    body.forEach(element=>{
        userList.push(element)
    });

    try {
        const results = await signalRepo.consumePreKeyBundles(userList);
        if (!results && results.length === 0) res.status(200).end("[]");
        const bundleList = [];
        const needRemove = [];

        for (let i = 0; i < results.length; i++) {
            const bundle = results[i];
            const signalKey = {
                user_id: bundle.userId,
                registration_id: bundle.registration_id,
                identity_key: bundle.identity_key,
                signed_pre_key: {
                    signature: bundle.signature,
                    key_id: bundle.skeyId,
                    pub_key: bundle.spk
                },
                one_time_pre_key: {
                    key_id: bundle.pKeyId,
                    pub_key: bundle.ppk
                }
            };
            bundleList.push(signalKey);
            needRemove.push(bundle.ppk)
        }
        res.status(200).end(JSON.stringify(bundleList));
        signalRepo.deletePreKeysById(needRemove)
    } catch (e) {
        console.log(`/ ${e}`);
        res.status(500).end()
    }
});

router.get("/signal/prekeys/count", async (req, res) => {
    console.log("/signal/keys/count");
    const userId = req.user_id;
    try {
        const results = await signalRepo.preKeyCount(userId)
        console.log(`keyCount ${JSON.stringify(results)}`)
        if (!results || results.length === 0)
            res.status(200).end(JSON.stringify({one_time_pre_keys_count: 0}))
        else res.status(200).end(JSON.stringify(results[0]))
    } catch (e) {
        console.log(`/signal/prekeys/count ${e}`);
        res.status(500).end()
    }
});

module.exports = router;
