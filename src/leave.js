let dbQuery = require('../dbConfig/queryRunner');
let login = require('./login');


let updateEmpMaster = reqBody => new Promise((resolve, reject) => {
  if (reqBody.empId == "" || reqBody.leavTpe == "") {
    reject({
      code: 400,
      message: "Missing parameter.",
      data: []
    });
  } else {
    let month = moment().month();
    month=month+1;
    let query1 = `select paid,comp_off from leave_emp_master where empid=${reqBody.id} and month=${month}`;
    console.log("query1----", query1);
    dbQuery.queryRunner(query1)
      .then(result => {
        console.log("res========",result);
        
        if (result && result.length == 0) {
          reject({
            code: 400,
            message: "Invalid parameter.",
            data: []
          });
        } else {
          let query = '';
          if (reqBody.leavTpe.toLowerCase() == 'paid') {
            query = `UPDATE leave_emp_master SET paid=${result[0].paid - reqBody.leaveCount} where empid=${reqBody.id} and month=${month}`;
            return dbQuery.queryRunner(query);
          } else if (reqBody.leavTpe.toLowerCase() == 'compoff') {
            query = `UPDATE leave_emp_master SET comp_off=${result[0].comp_off - reqBody.leaveCount} where empid=${reqBody.id} and month=${month}`;
            return dbQuery.queryRunner(query);
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
        console.log("result-------iiiii--",result);        
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

let checkBalancedLeave = (leaveCount, totalLeave, result) => new Promise((resolve, reject) => {
  if (result && result.length == 0) {
    let balLeave = leaveCount - 1.5;
    var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
      leaveToDate,totalLeave,pendingLeave,statusOfLeave,leaveCount)
      VALUES('LOP','${reqBody.reason}',${reqBody.id},
      '${reqBody.leaveFromDate}','${reqBody.leaveToDate}',${empData.totalLeave},${empData.totalLeave - reqBody.leaveCount},'pending',${reqBody.leaveCount})`;
    return dbQuery.queryRunner(sql);
  } else {

  }
});

let verifyLeaveRequest = (reqBody, empData) => new Promise((resolve, reject) => {
  if (reqBody.leaveCount <= empData.totalLeave) {
    let query = `select * from leave_details where empId=${reqBody.id} ORDER BY id DESC LIMIT 1`;
    dbQuery.queryRunner(query)
      .then(result => {
        if (result && result.length == 0) {
          return checkBalancedLeave(reqBody.leaveCount, empData.totalLeave, result);
        } else if (result && result[0].pendingLeave == 0) {
          var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
            leaveToDate,totalLeave,pendingLeave,statusOfLeave,leaveCount)
            VALUES('${LOP}','${reqBody.reason}',${reqBody.id},
            '${reqBody.leaveFromDate}','${reqBody.leaveToDate}',${empData.totalLeave},${result[0].pendingLeave - reqBody.leaveCount},'pending',${reqBody.leaveCount})`;
          return dbQuery.queryRunner(sql);
        } else {
          let lopLeave = reqBody.leaveCount - result[0].pendingLeave
          console.log("lopLeave------", lopLeave);
          //need to work
          if (lopLeave > 0) {
            console.log("come here-----", lopLeave);
            var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
              leaveToDate,totalLeave,pendingLeave,statusOfLeave,leaveCount)
              VALUES('${LOP}','${reqBody.reason}',${reqBody.id},
              '${reqBody.leaveFromDate}','${reqBody.leaveToDate}',${empData.totalLeave},${result[0].pendingLeave - reqBody.leaveCount},'pending',${lopLeave})`;
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
        var sql = `INSERT INTO leave_details(leaveType,reason,empId,leaveFromDate,
          leaveToDate,statusOfLeave,leaveCount,altNumber)
          VALUES('${reqBody.leaveType}','${reqBody.reason}',${reqBody.id},
          '${reqBody.leaveFromDate}','${reqBody.leaveToDate}','pending',${reqBody.leaveCount},'${reqBody.altNumber}')`;        
          //updateEmpMaster(reqBody);
          //return dbQuery.queryRunner(sql);
          return Promise.all([dbQuery.queryRunner(sql),updateEmpMaster(reqBody)]);
      } else {
        reject(result);
      }
    })
    .then(result => {
      console.log("result------>>>>>>>>>>>>",result);
      
      if (result && result.insertId != 0) {
        resolve({
          code: 200,
          message: "Successfully apply.",
          data: []
        });
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
  leaveRequest: leaveRequest,
  getBalanceLeave: getBalanceLeave
}