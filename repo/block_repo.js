const conn = require("../database_factory");

module.exports.block = (userId, blockUserId) => {
    const q = `insert into block (user_id,blocked_user_id) values ('${userId}','${blockUserId}')`;
    return new Promise((resolve, reject) => {
        conn.query(q, err => {
            if (err) reject(err);
            resolve()
        })
    })
};

module.exports.unblock = (userId, blockedUserId) => {
    const q = `delete from block where user_id='${userId}' AND blocked_user_id= '${blockedUserId})'`
    return new Promise((resolve, reject) => {
        conn.query(q, err => {
            if (err) reject(err);
            resolve()
        })
    })
}

module.exports.blockList = userId => {
    const q = `select blocked_user_id from block where user_id = '${userId}'`
    return new Promise((resolve, reject) => {
        conn(q, (err, results) => {
            if (err) reject(err);
            resolve(results)
        })
    })
};

