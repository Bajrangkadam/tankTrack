let dbQuery = require('../dbConfig/queryRunner');
let login = require('./login');

let checkUserExists = (empId) => new Promise((resolve, reject) => {
  let sql = `select * from emp_master where empid='${empId}' and isactive = 1`;
  dbQuery.queryRunner(sql)
    .then(result => {
      if (result && result.length != 0) {
        resolve({
          code: 200,
          message: "user exist.",
          data: result
        });
      } else {
        reject({
          code: 400,
          message: "Your Account is blocked, contact to HR.",
          data: result
        });
      }
    })
    .catch(err => {
      reject({
        code: 400,
        message: err,
        data: []
      });
    });
});

let registerUserExists = empId => new Promise((resolve, reject) => {
  if (empId == "") {
    return reject({
      code: 400,
      message: "EmpId is empty."
    });
  } else {
    var sql = `select em.* from registration rg right Join emp_master em on rg.empid=em.id where em.id=${empId} and em.isActive =1 and em.isRegister = 0`;
    dbQuery.queryRunner(sql)
      .then(result => {
        if (result && result.length == 0) {
          reject({
            code: 400,
            message: "User already exists.",
            data: []
          });
        } else {
          resolve({
            code: 200,
            message: "Data found.",
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

let userRegister = (reqBody) => new Promise((resolve, reject) => {
  checkUserExists(reqBody.empId)
    .then(result => {
      if (result.code == 200) {
        return registerUserExists(result.data[0].id);
      } else {
        reject(result);
      }
    })
    .then(result => {
      if (result.code == 200) {
        var sql = `INSERT INTO registration(empId,password) VALUES(${result.data[0].id},'${reqBody.password}');`;
        var updateQry = `update emp_master set isRegister = ${1} where id=${result.data[0].id}`;
        dbQuery.queryRunner(updateQry);
        return dbQuery.queryRunner(sql);
      } else {
        reject(result);
      }
    })
    .then(result => {
      if (result && result.insertId) {
        return login.userExists(result.insertId)
      } else {
        reject(result);
      }
    })
    .then(result => {
      if (result && result.code == 200) {
        result.message = "Account Registered Successfully."
        resolve(result);
      } else {
        reject(result);
      }
    })
    .catch(err => {
      reject(err);
    });
});

module.exports = {
  userRegister: userRegister
}