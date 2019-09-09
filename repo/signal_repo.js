const conn = require('../database_factory.js')

module.exports.pushKeys = (userId, keyRequest) => {
    return new Promise((resolve, reject) => {
        //  signed_pre_key
        const q = `insert into signalkeys (user_id, identity_key,signature,key_id, pub_key) VALUES 
        ('${userId}','${keyRequest.identity_key}', 
        '${keyRequest.signed_pre_key.signature}',
        '${keyRequest.signed_pre_key.key_id}',
        '${keyRequest.signed_pre_key.pub_key}') 
        ON  DUPLICATE KEY UPDATE  
        user_id = '${userId}',
        identity_key='${keyRequest.identity_key}',
        signature='${keyRequest.signed_pre_key.signature}', 
        key_id='${keyRequest.signed_pre_key.key_id}',
        pub_key='${keyRequest.signed_pre_key.pub_key}'`;
        conn.query(q, (err) => {
            if (err) reject(err);
            resolve()
        })
    })
};

module.exports.updateSignalKeys = (userId, keyRequest) => {
    return new Promise((resolve, reject) => {
        const q = `UPDATE signalkeys set identity_key='${keyRequest.identity_key}',
              signature='${keyRequest.signed_pre_key.signature}', 
              key_id='${keyRequest.signed_pre_key.key_id}',
              pub_key='${keyRequest.signed_pre_key.pub_key}' 
              where user_id='${userId}'`
        conn.query(q, err => {
            if (err) reject(err);
            resolve()
        })
    })
};


module.exports.consumeKeys = (userId) => {
    return new Promise((resolve, reject) => {
        const q = `SELECT s.*, a.registration_id FROM signalkeys s LEFT JOIN accounts a ON s.user_id = a.user_id where s.user_id='${userId}'`;
        conn.query(q, function (err, results) {
            if (err) reject(err);
            if (!results || results.length === 0) reject("No Keys found");
            resolve(results[0])
        })
    })
};


module.exports.pushPreKeys = (userId, preKeyList) => {
    return new Promise((resolve, reject) => {
        const q = `insert into prekeys (user_id, key_id, pub_key)
                   VALUES ?`
        const keyList = [];
        for (let i = 0; i < preKeyList.length; i++) {
            const preKey = [];
            preKey.push(userId);
            preKey.push(preKeyList[i].key_id);
            preKey.push(preKeyList[i].pub_key);
            keyList.push(preKey)
        }
        conn.query(q, [keyList], err => {
            if (err) reject(err);
            resolve()
        })
    })
};

module.exports.deletePreKeys = userId => {
    return new Promise((resolve, reject) => {
        const q = `DELETE
                   from prekeys WHERE user_id =${userId}`;
        conn.query(q, err => {
            if ((err)) reject(err);
            resolve()
        })
    })
};

module.exports.deletePreKey = (userId, preKeyId) => {
    const q = `DELETE FROM prekeys where user_id=${userId} AND key_id =${preKeyId} `;
    conn.query(q)
};

module.exports.pushPrekey = (userId, preKey) => {
    return new Promise((resolve, reject) => {
        const q = `insert into prekeys (user_id, key_id, pub_key) VALUES  ('${userId}','${preKey.key_id}', '${preKey.pub_key}')`;

        conn.query(q, (err) => {
            if (err) reject(err)
            resolve()
        })

    })
};

module.exports.consumePreKeyBundle = userId => {
    return new Promise((resolve, reject) => {
        const q = `SELECT  s.identity_key, s.pub_key as spk, s.key_id as skeyId, s.signature, a.registration_id , p.key_id as pKeyId, p.pub_key as ppk 
        FROM signalkeys s
        INNER JOIN prekeys p ON s.user_id=p.user_id
        INNER JOIN accounts a ON s.user_id=a.user_id
        WHERE  s.user_id = '${userId}' LIMIT  1`;
        conn.query(q, (err, results) => {
            if (err) reject(err);
            resolve(results)
        })
    })
};

module.exports.consumePreKeyBundles = (userList) => {
    return new Promise((resolve, reject) => {
        const q = `SELECT  s.user_id, s.identity_key, s.pub_key as spk, s.key_id as skeyId, s.signature, a.registration_id , p.key_id as pKeyId, p.pub_key as ppk 
        FROM signalkeys s
        INNER JOIN prekeys p ON s.user_id=p.user_id
        INNER JOIN accounts a ON s.user_id=a.user_id
        WHERE  s.user_id IN (${userList.join(",")}) GROUP BY s.user_id`;
        console.log(`query ${q}`)
        conn.query(q, (err, results) => {
            if (err) reject(err);
            resolve(results)
        })
    })
};

module.exports.deletePreKeysById = (keyList) => {
    if (!keyList || keyList.length === 0) return
    let deleteList = ""

    for (let i = 0; i < keyList.length - 1; i++)
        deleteList += `'${keyList[i]}',`

    deleteList += `'${keyList[keyList.length - 1]}'`

    console.log(`Keylist delete ${deleteList}`)

    const q = `DELETE FROM prekeys WHERE pub_key IN (${deleteList})`;
    console.log("delete %s ", q)
    conn.query(q)
}

module.exports.consumeRandomPrekey = (userId) => {
    return new Promise((resolve, reject) => {
        const q = `SELECT key_id, pub_key FROM prekeys where user_id='${userId}'  ORDER BY RAND() LIMIT 1 `;
        conn.query(q, function (err, results) {
            if (err) reject(err);
            if (!results || results.length === 0) reject("404");
            resolve(results[0])
        })
    })
};

module.exports.preKeyCount = userId => {
    return new Promise((resolve, reject) => {
        const q = `select count(*) as one_time_pre_keys_count from prekeys where user_id='${userId}'`
        conn.query(q, (err, results) => {
            if (err) reject(err);
            return resolve(results)
        })
    })
}