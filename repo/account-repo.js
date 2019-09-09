var conn = require("../database_factory.js")


function findAccount(user_id) {
    return new Promise((resolve, reject) => {
        const query = `select user_id from accounts where user_id =${user_id}`;
        conn.query(query, (err, result, fields) => {
            if (err) reject(err);
            if (!result || result.length == 0)
                resolve(false)
            resolve(true)
        })
    })
}


module.exports.upsert = async function (accountRequest) {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().getTime();
        const q = `INSERT INTO accounts (user_id, registration_id, platform_version, app_version, created_at) VALUES
         ( '${accountRequest.user_id}',
         '${accountRequest.registration_id}',
         '${accountRequest.platform_version}',
         '${accountRequest.app_version}','${createdAt}' )
        ON DUPLICATE KEY UPDATE
        user_id='${accountRequest.user_id}',
        registration_id ='${accountRequest.registration_id}',
        platform_version ='${accountRequest.platform_version}',
        app_version ='${accountRequest.app_version}'`;
        conn.query(q, err => {
            if (err) reject(err);
            resolve();
        })
    })
};

function insert(accoutRequest) {
    return new Promise((resolve, reject) => {
        var created_at = new Date().getTime()

        var sql = `INSERT INTO accounts (user_id, registration_id ,platform_version, app_version, 
			  session_secret, created_at) VALUES (
				  ${accoutRequest.user_id}, '${accoutRequest.registration_id}',
				'${accoutRequest.platform_version}','${accoutRequest.app_version}',
				'${accoutRequest.session_secret}','${created_at}' )`;

        conn.query(sql, function (err, result) {
            if (err) reject(err);
            resolve(true)
        })
    })
}

function update(accoutRequest) {
    return new Promise((resolve, reject) => {
        var q = `update accounts set registration_id='${accoutRequest.registration_id}',
        platform_version='${accoutRequest.platform_version}',
        app_version='${accoutRequest.app_version}',
        session_secret='${accoutRequest.session_secret}' where user_id = ${accoutRequest.user_id}`

        conn.query(q, function (err, result) {
            if (err) reject(err);
            resolve(true)
        })
    })
}