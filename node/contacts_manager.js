const router = require('express').Router();
const conn = require('../database_factory.js');

const REGISTERED = 1;
const NOT_REGISTERED = 0;

function log(title, msg) {
    console.log("-------" + title + "------")
    console.log(msg)
    console.log("-----------------------")
}


async function handleRequest(req, res) {
    try {
        //Requesting user phone number
        const userId = req.user_id;

        log(`/discoverPhoneNumber ${userId}`);
        //all contacts came from clients
        const localContactsList = req.body;

        log("Client contacts", JSON.stringify(localContactsList));

        //all contacts exists on server
        const serverContacts = await findContactsForUserId(userId);

        log("Server contacts", serverContacts);

        //contacts to delete
        const needDeleteList = getContactsToDelete(localContactsList, serverContacts);

        log("Contacts to delete", needDeleteList);

        await deleteContact(userId, needDeleteList);

        if (!localContactsList || localContactsList.length === 0) {
            res.status(200).end("[]")
            return
        }

        //all client registered phone number
        const registeredContactList = await getRegisteredContacts(userId, localContactsList);

        log("RegisteredContactList", registeredContactList);

        //newContacts to insert
        const newLocalContactList = getContactsToInsert(localContactsList, serverContacts);

        log("newContacts(__ insert the list__) ", newLocalContactList);

        await insertNewContacts(userId, newLocalContactList);

        log("Contacts inserted","Success");

        await updateRegisteredPhoneNumber(userId, registeredContactList);

        log("Updated","Success");
        log("Response ",JSON.stringify(registeredContactList))

        res.status(200).end(JSON.stringify(registeredContactList));
    } catch (error) {
        console.log("/contacts "+error);
        res.status(500).end("Internal server error")
    }
}

async function findContactsForUserId(user_id) {
    return new Promise(function (resolve, reject) {
        const q = `select contact_number, displayname, isRegistered  from contacts where user_id =${user_id}`;
        conn.query(q, function (err, results) {
            if (err) reject(err);
            if (!results || results.length === 0) resolve([]);
            resolve(results)
        })
    })
}

function getContactsToDelete(clientContactList, serverContactList) {
    if (!serverContactList || serverContactList.length === 0) return [];

    if (!clientContactList || clientContactList.length === 0) return serverContactList;

    return serverContactList.filter((serverContact) => {
        !clientContactList.find((clientContact) => {
            return clientContact.phoneNumber === serverContact.contact_number
        })
    });
}

function deleteContact(userId, needDeleteList) {
    if (!needDeleteList || needDeleteList.length === 0)
        return;
    return new Promise(function (resolve, reject) {
        const q = `DELETE FROM contacts WHERE contact_number IN ( ${needDeleteList.join(",")}) AND user_id=${userId}`;
        conn.query(q, function (err) {
            if (err) reject(err);
            resolve()
        })
    })
}

function getContactsToInsert(localContacts, serverContacts) {
    if (serverContacts || serverContacts.length === 0) return localContacts;

    return localContacts.filter(localContact => {
        serverContacts.find(serverContact => {
            return serverContact.contact_number === localContact.phoneNumber
        })
    });
}

async function insertNewContacts(userId, newContacts) {

    if (!newContacts || newContacts.length === 0) return;

    return new Promise(function (resolve, reject) {
        const insertQ = `insert into contacts (user_id, contact_number, displayname, isRegistered) VALUES ? `;
        const contactsToInsert = [];
        for (let i = 0; i < newContacts.length; i++) {
            const newContact = [];
            newContact.push(userId);
            newContact.push(newContacts[i].phoneNumber);
            newContact.push(newContacts[i].displayName);
            newContact.push(NOT_REGISTERED);
            contactsToInsert.push(newContact);
        }
        conn.query(insertQ, [contactsToInsert], function (err) {
            if (err) reject(err);
            resolve();
        });

    })
}


async function getRegisteredContacts(userId, localContactList) {
    return new Promise(function (resolve, reject) {
        let mapList = localContactList.map((localContact) => {
            return localContact.phoneNumber
        });
        const q = `select accounts.user_id , profile.full_name , profile.bio from accounts LEFT JOIN profile ON accounts.user_id = profile.user_id where accounts.user_id in ( ${mapList.join(",")} )`;
        conn.query(q, function (err, results) {
            if (err) reject(err);
            if (!results) resolve([]);
            resolve(results)
        })
    })
}

function updateRegisteredPhoneNumber(userId, contactList) {
    if (!contactList || contactList.length === 0) return;
    return new Promise(function (resolve, reject) {
        const mapList = contactList.map(contact => { return contact.user_id });
        const q = `update contacts SET isRegistered  = ${REGISTERED} where user_id= ${userId} and contact_number IN ( ${mapList.join(",")} ) AND isRegistered != ${REGISTERED}`;
        conn.query(q, function (err) {
            if (err) reject(err);
            resolve(true)
        })
    })
}


router.post('/contacts', handleRequest);

module.exports = router;
