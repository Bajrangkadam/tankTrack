let dbQuery = require('../dbConfig/queryRunner');
let login = require('./login');

let checkIn = (reqBody) => new Promise((resolve, reject) => {
  if (reqBody.userName == "" || reqBody.password == "") {
    return reject({
      code: 400,
      message: "Please enter userName and Password."
    });
  } else {
    login.userExists(reqBody.id)
      .then(result => {
        if (result.code == 200) {
          var sql = `select id,empId,name, emailId, phoneNumber from registration where empId='${reqBody.userName}' and password ='${reqBody.password}'`;
          var dbResult = "";
          return dbQuery.queryRunner(sql);
        } else {
          reject(result);
        }
      })
      then(result =>{
        console.log("result-",result);
        
        
        resolve(result);
      })
      .catch(err => {
        reject({
          code: 500,
          message: err,
        });
      });
  }
});

module.exports = {
  checkIn: checkIn
}