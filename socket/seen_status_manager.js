const seenRepo = require('../repo/last_seen_repo.js');
const userList = [];

module.exports.addOnline = userId => {
    if (!isOnline(userId)) {
        console.log("Adding in online list");
        userList.push(userId)
    }
    console.log("Added")
};

module.exports.removeOnline = userId => {
    const index = userList.indexOf(userId);
    if (index !== -1) {
        console.log("Removing from online list");
        userList.splice(index, 1);
        seenRepo.updateLastSeen(userId, new Date().toISOString());
        console.log("Removed")
    }

};

function isOnline(userId) {
    return userList.indexOf(userId) !== -1
}

module.exports.lastSeen = userId => {
    seenRepo.getLastSeen(userId)
};

module.exports.isOnline = isOnline;
