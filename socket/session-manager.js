const Session = require('./local-session.js');

const sessions = {};

module.exports.addSession = (socketId, userId, io) => {
    const session = new Session(socketId, userId, io);
    sessions[userId] = session;
    session.startQueue();
    console.log(`New session ${userId}`)
};

module.exports.removeSession = (userId) => {
    console.log("Removing session %s ", userId);
    const session = sessions[userId];
    if (session) 
    session.closeQueue();
    delete sessions[userId];
    console.log(`After remove users ${Object.keys(sessions).length}`)
};

module.exports.getSession = (userId) => {
    return sessions[userId]
};