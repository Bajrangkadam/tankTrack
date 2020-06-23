const mysql = require('mysql')
let dbconfig = require("../appconfig.json");
var connectionPool = mysql.createPool(dbconfig.dbConfig);

module.exports = {
    getConnection: function () {
        return new Promise(function (resolve, reject) {
            connectionPool.getConnection(function (err, connection) {
                if (err) reject(err);
                resolve(connection);
            });
        });
    }
};
