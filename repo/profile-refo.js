const conn = require("../database_factory.js");
const utils = require("../util/utils.js");
const s3 = require("../util/aws")


module.exports.insert = async function (user_id, accountUpdateRequest) {

    let avatarKey;
    const full_name = accountUpdateRequest.full_name;

    let q = "INSERT INTO profile (user_id, full_name"
    if (accountUpdateRequest.avatar) {
        avatarKey = utils.generateAvatarKey();
        await s3.uploadToS3(accountUpdateRequest.avatar, avatarKey);
        q = `${q}, avatar, thumbnail )`
    } else {
        q = `${q} )`
    }
    q = `${q} values ('${user_id}', '${full_name}'`;

    if (accountUpdateRequest.avatar && avatarKey) {
        let thumbnail = accountUpdateRequest.thumbnail;
        q = `${q}, '${avatarKey}', '${thumbnail}')`;
    } else {
        q = `${q} )`
    }

    return new Promise(function (resolve, reject) {
        conn.query(q, function (err) {
            if (err) reject(err);
            resolve(true)
        })
    })
};


module.exports.update = async function (user_id, accountUpdateRequest) {
    let query = "update profile set";
    if (accountUpdateRequest.full_name) {
        query = `${query} full_name='${accountUpdateRequest.full_name}'`
    } else if (accountUpdateRequest.bio) {
        query = `${query} bio='${accountUpdateRequest.bio}'`
    } else if (accountUpdateRequest.thumbnail && accountUpdateRequest.avatar) {
        const avatarKey = utils.generateAvatarKey();
        await s3.uploadToS3(accountUpdateRequest.avatar, avatarKey);
        query = `${query} thumbnail='${accountUpdateRequest.thumbnail}',avatar='${avatarKey}'`
    }

    query = `${query}  where user_id='${user_id}'`;

    return new Promise(function (resolve, reject) {
        conn.query(query, function (err) {
            if (err) reject(err);
            resolve()
        })
    })
};

module.exports.removeProfile = function (userId) {
    const q = `update profile set thumbnail=null , avatar =null  where user_id='${userId}'`;
    return new Promise(function (resolve, reject) {
        conn.query(q, function (err) {
            if (err) reject(err);
            resolve()
        })
    })
};

module.exports.isProfileExist = function (user_id) {
    return new Promise(function (resolve, reject) {
        const q = `select full_name from profile where user_id = '${user_id}'`;
        conn.query(q, function (err, result) {
            if (err) reject(err);
            resolve(result[0])
        })
    })
}


//specific function for /profiles/fetch url
module.exports.fetchProfiles = function (user_id) {
    return new Promise(function (resolve, reject) {
        const q = `select p.user_id, p.full_name,p.thumbnail,p.bio from contacts c left join profile p on
         c.contact_number = p.user_id where c.user_id = ${user_id} and c.isRegistered = 1 `;

        conn.query(q, function (err, results) {
            if (err) reject(err)
            resolve(results)
        })
    })
}


module.exports.getAvatarAndThumbnail = function (user_id) {
    return new Promise(function (resolve, reject) {
        const q = `select avatar,thumbnail from profile where user_id = '${user_id}'`

        conn.query(q, function (err, result) {
            if (err) reject(err)
            resolve(result[0])
        })
    })
}


// USED FOR GET THE USER PROFILE WITHOUT AVATAR KEY
module.exports.findProfile = function (user_id) {
    return new Promise(function (resolve, reject) {
        const q = `select user_id, full_name, bio, thumbnail from profile where user_id='${user_id}'`
        conn.query(q, function (err, result) {
            if (err) reject(err)
            resolve(result[0])
        })
    })
}


// USED FOR GET THE USER PROFILE WITH AVATAR KEY
module.exports.getAccountProfile = function (user_id) {
    return new Promise((resolve, reject) => {
        const q = `select *
                   from profile where user_id =${user_id}`
        conn.query(q, (err, result) => {
            if (err) reject(err);

            resolve(result[0])
        })
    })
}


module.exports.fetchUsers = (userIds) => {
    return new Promise((resolve, reject) => {
        const q = `select user_id,full_name,thumbnail,bio from profile where user_id in(${userIds.join(",")})`
        conn.query(q, (err, results) => {
            if (err) reject(err)
            resolve(results)
        })
    })
}

