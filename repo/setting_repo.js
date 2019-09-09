const conn = require('../database_factory')

module.exports.updateProfileAccessSetting = (userId, profileAccess) => {
    const q = `INSERT INTO settings (user_id,profile_seen_access) value (${userId},${profileAccess})
    ON  DUPLICATE KEY UPDATE 
    user_id = ${userId},
    profile_seen_access = ${profileAccess} `;

    return new Promise((resolve, reject) => {
        conn.query(q, err => {
            if (err) reject(err);
            resolve()
        })
    })
};

module.exports.updateSeenAccessSetting = (userId, seenAccess) => {
    const q = `INSERT INTO settings (user_id,last_seen_access) value (${userId},${seenAccess})
    ON  DUPLICATE KEY UPDATE 
    user_id = ${userId},
    last_seen_access = ${seenAccess} `;

    return new Promise((resolve, reject) => {
        conn.query(q, err => {
            if (err) reject(err);
            resolve()
        })
    })
};

module.exports.getSetting = userId => {
    return new Promise((resolve, reject) => {
        //conn.query()
    })
};

