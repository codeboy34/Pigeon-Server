const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const tokenVerifier = require('./auth/firebase-auth.js');
const fs = require('fs');

const accountManager = require('./node/account_manager.js');
const contactsManager = require('./node/contacts_manager.js');
const profileManager = require("./node/profile_manager.js");
const groupManager = require('./node/group_manager.js');
const signalManager = require('./node/signal_manager.js');
const settingsManager = require('./node/settting_manager.js');
const blockManager = require('./node/block_manager');

const app = express();


const server = http.Server(app);
server.listen(8000);

//middleware 
app.use(bodyParser.json({limit: '50mb'}));
app.use(tokenVerifier.verifyToken);

app.use('/login', accountManager);
app.use(contactsManager);
app.use(profileManager);
app.use(groupManager);
app.use(signalManager);
app.use(settingsManager);
app.use(blockManager);


app.get('/', function (req, res) {
  res.send('hello world')
});

module.exports = server;


require('./socket/socket_manager.js');