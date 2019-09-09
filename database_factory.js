const mysql = require('mysql');

const con = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "pigeon",
    connectionLimit:500
});


// Attempt to catch disconnects
con.on('connection', function (connection) {
    console.log('DB Connection established');

    connection.on('error', function (err) {
        console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function (err) {
        console.error(new Date(), 'MySQL close', err);
    });
});


module.exports = con;
