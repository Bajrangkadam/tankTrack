var mysqlConnection = require('./dbconnection');

function queryRunner(qry) {
    return new Promise((resolve, reject) => {
        if (qry === null) {
            console.log('Error in query string: ' + JSON.stringify(qry));
            return reject({
                code: 400,
                error: 'No Query Found'
            });
        } else {
            console.log("que-----", qry);
            mysqlConnection.getConnection().then((connection) => {
                connection.query(qry, (error, results, fields) => {
                    if (error) reject(error);
                    connection.release();
                    resolve(results);
                });
            }).catch(e => {
                console.error('query error out', e.message, e.stack);
                //deferred.reject(e.message);
                reject({
                    code: 500,
                    error: 'Internal Connection Error'
                });
            });
        }

    });
};

module.exports.queryRunner = queryRunner ;