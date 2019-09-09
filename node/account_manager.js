const router = require('express').Router();
const profileRepo = require("../repo/profile-refo.js");
const accountRepo = require('../repo/account-repo.js');
const s3 = require("../util/aws.js");

router.post('/', async function (req, res) {
    const accountRequest = req.body;
    console.log("Account manager ",)
    console.log(accountRequest);
	try {

		await accountRepo.upsert(accountRequest);
		console.log("Upserted")
        const profile = await profileRepo.getAccountProfile(accountRequest.user_id);
        console.log("GET PROFILE");
        if (profile) {
            console.log(`profile found ${JSON.stringify(profile)}`);
			if (profile.avatar!=null) {
			    console.log("Avatar found")
                const avatarKey = profile.avatar;
                const data = await s3.download(avatarKey);
                profile.avatar = data.Body.toString("utf-8")
			}
			console.log("Sending response ")
			res.status(200).end(JSON.stringify(profile))
            console.log("REponse sent")
		}
		else {
			res.status(200).end("{}")
		}
	} catch (err) {
		console.log(err);
		res.status(500).end();
	}
});



module.exports = router;
