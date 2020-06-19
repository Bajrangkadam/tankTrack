let dbQuery = require('../dbConfig/queryRunner');
let login = require('./login');

let verifyLeaveRequest = (reqBody, empData) => new Promise((resolve, reject) => {
  if (reqBody.leaveCount <= empData.totalLeave) {
    let query = `select * from leave_details where empId=${reqBody.id} ORDER BY id DESC LIMIT 1`;
    dbQuery.queryRunner(query)
      .then(result => {
        if (result && result.length == 0) {
          var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
            leaveToDate,totalLeave,pendingLeave,statusOfLeave,leaveCount)
            VALUES('${LOP}','${reqBody.reason}',${reqBody.id},
            '${reqBody.leaveFromDate}','${reqBody.leaveToDate}',${empData.totalLeave},${empData.totalLeave - reqBody.leaveCount},'pending',${reqBody.leaveCount})`;
          return dbQuery.queryRunner(sql);
        } else if (result && result[0].pendingLeave == 0) {
          var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
            leaveToDate,totalLeave,pendingLeave,statusOfLeave,leaveCount)
            VALUES('${LOP}','${reqBody.reason}',${reqBody.id},
            '${reqBody.leaveFromDate}','${reqBody.leaveToDate}',${empData.totalLeave},${result[0].pendingLeave - reqBody.leaveCount},'pending',${reqBody.leaveCount})`;
          return dbQuery.queryRunner(sql);
        } else {
          //need to work
          if (result[0].pendingLeave < reqBody.leaveCount) {
            var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
              leaveToDate,totalLeave,pendingLeave,statusOfLeave,leaveCount)
              VALUES('${LOP}','${reqBody.reason}',${reqBody.id},
              '${reqBody.leaveFromDate}','${reqBody.leaveToDate}',${empData.totalLeave},${result[0].pendingLeave - reqBody.leaveCount},'pending',${reqBody.leaveCount})`;
            return dbQuery.queryRunner(sql);
          } else {
            var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
              leaveToDate,totalLeave,pendingLeave,statusOfLeave,leaveCount)
              VALUES('${LOP}','${reqBody.reason}',${reqBody.id},
              '${reqBody.leaveFromDate}','${reqBody.leaveToDate}',${empData.totalLeave},${result[0].pendingLeave - reqBody.leaveCount},'pending',${reqBody.leaveCount})`;
            return dbQuery.queryRunner(sql);
          }
        }
      })
      .then(result => {
        console.log("result----", result);
        if (result && result.code != 400) {
          resolve({
            code: 200,
            message: "Leave apply succussfully."
          });
        } else {
          reject(result);
        }
      })
      .catch(err => {
        reject(err);
      });

  } else {
    reject({
      code: 400,
      message: `Leave not balanced.`,
      data: []
    });
  }
});

let leaveRequest = reqBody => new Promise((resolve, reject) => {
  login.userExists(reqBody.id)
    .then(result => {
      if (result.code == 200) {
        return verifyLeaveRequest(reqBody, result.data[0]);
      } else {
        reject(result);
      }
    })
    .then(result => {
      if (result && result.code == 200) {
        resolve(result);
      } else {
        reject(result);
      }
    })
    .catch(err => {
      reject({
        code: err.code ? err.code : 500,
        message: err.message
      });
    });
});

module.exports = {
  leaveRequest: leaveRequest
}