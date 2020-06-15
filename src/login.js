let dbQuery = require('../dbConfig/queryRunner');

let userLogin = reqBody => new Promise((resolve, reject) => {
  if (reqBody.userName == "" || reqBody.password == "") {
    return reject({
      code: 400,
      message: "Please enter userName and Password."
    });
  } else {
    var sql = `select id,empId,name, emailId, phoneNumber from registration where empId='${reqBody.userName}' and password ='${reqBody.password}'`;
    var dbResult = "";
    dbQuery.queryRunner(sql)
      .then(result => {
        dbResult = result;
        if (result && result.length == 0) {
          reject({
            code: 400,
            message: "Invalid username passwaord."
          });
        } else {
          var sql = `INSERT INTO login(empId,loginTime,isActive)
          VALUES(${dbResult[0].id},'${reqBody.loginTime}',1)`;
          return dbQuery.queryRunner(sql);
        }
      })
      .then(result => {
        resolve({
          code: 200,
          message: "User login successfully.",
          data: dbResult
        });
      })
      .catch(err => {
        reject({
          code: 400,
          message: err
        });
      });
  }
});

let userExists = empId => new Promise((resolve, reject) => {
  if (reqBody.empId == "") {
    return reject({
      code: 400,
      message: "EmpId is empty."
    });
  } else {
    var sql = `select id,empId,name, emailId, phoneNumber from registration where id='${reqBody.id}' and isActive =1`;
    dbQuery.queryRunner(sql)
      .then(result => {
        if (result && result.length == 0) {
          reject({
            code: 400,
            message: "No data found.",
            data : []
          });
        } else {
          resolve({
            code: 200,
            message: "Data fetch successfully.",
            data: result
          });
        }
      })
      .catch(err => {
        reject({
          code: 400,
          message: err
        });
      });
  }
});

module.exports = {
  userLogin: userLogin,
  userExists: userExists
}