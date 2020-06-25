let dbQuery = require('../dbConfig/queryRunner');
let login = require('./login');

let leaveApprove = reqBody => new Promise((resolve, reject) => {
  let userData = ''
  if (reqBody.statusOfLeave.toLowerCase() == 'approve' || reqBody.statusOfLeave.toLowerCase() == 'reject') {
    let sql = `select * from leave_details where id=${reqBody.id}`;
    dbQuery.queryRunner(sql)
      .then(result => {
        if (result && result.length != 0) {
          let sql = `update leave_details set statusOfLeave='${reqBody.statusOfLeave}' where id=${reqBody.id}`;
          return dbQuery.queryRunner(sql)
        } else {
          reject(result);
        }
      })
      .then(result => {        
        if (result && result.insertId == 0) {
          resolve({
            code: 200,
            message: "Leave approve successfully.",
            data: []
          });
        } else {
          reject(result);
        }
      })
      .catch(err => {
        reject({
          code: err.code ? err.code : 500,
          message: err.message,
          data: []
        });
      });
  } else {
    reject({
      code: 400,
      message: "Invalid leave type.",
      data: []
    });
  }
});

let getEmpLeaveOnRmId = id => new Promise((resolve, reject) => {
  if (id == "") {
    reject({
      code: 400,
      message: "Missing parameter.",
      data: []
    });
  } else {
    let query = `select ld.id,em.empId,em.name,ld.reason,ld.leaveType,ld.leaveFromDate,ld.leaveToDate,ld.leaveCount,ld.statusOfLeave from leave_details ld
    join emp_master em on ld.empid=em.id where ld.rmid=${id} and ld.statusOfLeave='pending'`
    dbQuery.queryRunner(query)
      .then(result => {
        if (result && result.length == 0) {
          reject({
            code: 400,
            message: "No data found.",
            data: []
          });
        } else {
          resolve({
            code: 200,
            message: "Data found successfully.",
            data: result
          });
        }
      })
      .catch(err => {
        reject({
          code: 500,
          message: err,
          data: []
        });
      })
  }
});

let updateEmpMaster = reqBody => new Promise((resolve, reject) => {
  if (reqBody.empId == "") {
    reject({
      code: 400,
      message: "Missing id(EmpID) parameter.",
      data: []
    });
  } else {
    let month = moment().month();
    month = month + 1;
    let query1 = `select paid,comp_off from leave_emp_master where empid=${reqBody.id} and month=${month}`;
    dbQuery.queryRunner(query1)
      .then(result => {
        if (result && result.length == 0) {
          reject({
            code: 400,
            message: "User leave data not found.",
            data: []
          });
        } else {
          let query = '';
          if (reqBody.leaveType.toLowerCase() == 'paid') {
            if (result && result[0].paid >= reqBody.leaveCount) {
              query = `UPDATE leave_emp_master SET paid=${result[0].paid - reqBody.leaveCount} where empid=${reqBody.id} and month=${month}`;
              return dbQuery.queryRunner(query);
            } else {
              reject({
                code: 400,
                message: "Leave not balanced.",
                data: []
              });
            }
          } else if (reqBody.leaveType.toLowerCase() == 'compoff') {
            if (result && result[0].comp_off >= reqBody.leaveCount) {
              query = `UPDATE leave_emp_master SET comp_off=${result[0].comp_off - reqBody.leaveCount} where empid=${reqBody.id} and month=${month}`;
              return dbQuery.queryRunner(query);
            } else {
              reject({
                code: 400,
                message: "Leave not balanced.",
                data: []
              });
            }
          } else {
            reject({
              code: 400,
              message: "Invalid parameter.",
              data: []
            });
          }
        }
      })
      .then(result => {
        if (result && result.insertId == 0) {
          resolve({
            code: 200,
            message: "Data update successfully.",
            data: []
          });
        } else {
          reject(result);
        }
      })
      .catch(err => {
        reject({
          code: 500,
          message: err,
          data: []
        });
      })
  }
});

let getBalanceLeave = reqBody => new Promise((resolve, reject) => {
  if (reqBody.empId == "" || reqBody.leavTpe == "") {
    reject({
      code: 400,
      message: "Missing parameter.",
      data: []
    });
  } else {
    let query = ''
    if (reqBody.leavTpe.toLowerCase() == 'paid') {
      query = `select paid from leave_emp_master where paid=${reqBody.leavTpe} and empid=${reqBody.empId}`;
    } else if (reqBody.leavTpe.toLowerCase() == 'compoff') {
      query = `select comp_off from leave_emp_master where comp_off=${reqBody.leavTpe} and empid=${reqBody.empId}`;
    } else {
      reject({
        code: 400,
        message: "Invalid parameter.",
        data: []
      });
    }
    dbQuery.queryRunner(query)
      .then(result => {
        if (result && result.length == 0) {
          reject({
            code: 400,
            message: "No data found.",
            data: []
          });
        } else {
          resolve({
            code: 200,
            message: "Data found successfully.",
            data: result
          });
        }
      })
      .catch(err => {
        reject({
          code: 500,
          message: err,
          data: []
        });
      })
  }
});

let leaveRequest = reqBody => new Promise((resolve, reject) => {
  let userData = ''
  if (reqBody.leaveType.toLowerCase() == 'paid' || reqBody.leaveType.toLowerCase() == 'compoff') {
    login.userExists(reqBody.id)
      .then(result => {
        if (result.code == 200) {
          userData = result.data;
          return updateEmpMaster(reqBody);
        } else {
          reject(result);
        }
      })
      .then(result => {
        if (result && result.code == 200) {
          var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
            leaveToDate,statusOfLeave,leaveCount,altNumber,rmId)
            VALUES('${reqBody.leaveType}','${reqBody.reason}',${reqBody.id},
            '${reqBody.leaveFromDate}','${reqBody.leaveToDate}','pending',
            ${reqBody.leaveCount},'${reqBody.altNumber}',${userData[0].rm})`;
          return dbQuery.queryRunner(sql);
        } else {
          reject(result);
        }
      })
      .then(result => {
        if (result && result.insertId !== 0) {
          resolve({
            code: 200,
            message: "Leave applied successfully.",
            data: []
          });
        } else {
          reject(result);
        }
      })
      .catch(err => {
        reject({
          code: err.code ? err.code : 500,
          message: err.message,
          data: []
        });
      });
  } else {
    reject({
      code: 400,
      message: "Invalid leave type.",
      data: []
    });
  }
});

module.exports = {
  leaveRequest: leaveRequest,
  getBalanceLeave: getBalanceLeave,
  getEmpLeaveOnRmId: getEmpLeaveOnRmId,
  leaveApprove: leaveApprove
}