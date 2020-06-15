let dbQuery = require('../dbConfig/queryRunner');

let userRegister = (reqBody) => new Promise((resolve, reject) => {
  var sql = `INSERT INTO registration(empId,name,
    emailId,
    phoneNumber,
    password,
    role,
    createdBy)
    VALUES('${reqBody.empId}','${reqBody.name}','${reqBody.email}','${reqBody.mobile}','${reqBody.password}','${reqBody.role}',1)`;
  
  dbQuery.queryRunner(sql)
    .then(result => {
      resolve({
        code: 200,
        message: "user successfully saved."
      });
    })
    .catch(err => {
      reject({
        code: 400,
        message: err
      });
    });

});

module.exports = {
  userRegister: userRegister
}