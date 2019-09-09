const conn = require("../database_factory.js");



// return user_id s of contacts for specific contact_number
//used for events eg.profile of avatar changes

module.exports.queryUserIds = function (user_id) {
    return new Promise(function (resolve, reject) {
        const q = `select user_id from contacts where contact_number='${user_id}'`;
        conn.query(q, function (err, results) {
            if (err) throw reject(err);
            return resolve(results)
        })
    })
};