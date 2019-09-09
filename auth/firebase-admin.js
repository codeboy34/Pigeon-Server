var admin = require('firebase-admin');

var serviceAccount = require("./cred/pigeon-f3755-firebase-adminsdk-qhl2a-9f1780b744.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pigeon-f3755.firebaseio.com",
    storageBucket: "gs://pigeon-f3755.appspot.com"

});

module.exports = admin