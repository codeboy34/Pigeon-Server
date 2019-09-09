const conn = require("../database_factory");

conn.query("select * from accounts", function (err, results, columns) {
    if (err) {
        console.log("Query error %s ", err);
        return
    }
    console.log("Result %s ", JSON.stringify(results))
});