const conn = require("../database_factory")

module.exports.updateLastSeen = (userId, timestamp) => {
    const q = `INSERT INTO last_seen (user_id, timestamp) VALUES ('${userId}','${timestamp}')
    ON  DUPLICATE KEY UPDATE
    user_id = '${userId}',
    timestamp = '${timestamp}'`;
   conn.query(q)
};

module.exports.getLastSeen = userId => {
    const q = `select timestamp from last_seen where user_id = ${userId}`
    return new Promise((resolve, reject) => {
        conn.query(q, (err, results) => {
            if (err) reject(err);
            resolve(results)
        })
    })
}