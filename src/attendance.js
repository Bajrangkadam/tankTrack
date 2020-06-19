let dbQuery = require('../dbConfig/queryRunner');
let login = require('./login');

let checkUserIsCheckout = (empId, checkInDate) => new Promise((resolve, reject) => {
  let query = `select * from attendance where empId=${empId} and checkInDate='${checkInDate}' and isActive=1`;
  dbQuery.queryRunner(query)
    .then(result => {
      if (result.length ==! 0) {
        let checkInData = result[0];
        if (checkInData.checkoutTime != null && checkInData.checkOutLocation != null) {
          resolve({
            code: 200,
            message: "CheckIn already.",
            data: checkInData
          });
        } else {
          reject({
            code: 400,
            message: `Please checkout for location ${checkInData.checkInLocation} & login time ${checkInData.checkInTime}`,
            data: checkInData
          });
        }
      } else {
        resolve({
          code: 200,
          message: "User not checkIn",
          data: result
        });
      }
    })
    .catch(err => {
      console.log("err=====>>", err);
      reject(err);
    });
});

let checkUserIsCheckIn = empId => new Promise((resolve, reject) => {
  let query = `select * from attendance where empId=${empId} and isActive=1`;
  dbQuery.queryRunner(query)
    .then(result => {
      console.log("result---->>>M>>>>", result);
      if (result.length ==! 0) {
        let checkInData = result[0];
        if (checkInData.checkoutTime != null && checkInData.checkOutLocation != null) {
          resolve({
            code: 200,
            message: "User already checkOut.",
            data: checkInData
          });
        } else {
          resolve({
            code: 200,
            message: "User is checkIn and need to checkOut.",
            data: checkInData
          });
        }
      } else {
        resolve({
          code: 200,
          message: "User not checkIn",
          data: result
        });
      }
    })
    .catch(err => {
      reject(err);
    });
});

let checkIn = reqBody => new Promise((resolve, reject) => {
  login.userExists(reqBody.id)
    .then(result => {
      if (result.code == 200) {
        return checkUserIsCheckout(reqBody.id, reqBody.checkInDate);
      } else {
        reject(result);
      }
    })
    .then(result => {
      console.log("result------<<<>>>>>>>>>", result);
      if (result.code == 200) {
        var sql = `INSERT INTO attendance(checkInDate,checkInTime,isVisit,
        visitReason,
        checkInLocation,
        comment,
        isActive,
        empId)
        VALUES('${reqBody.checkInDate}','${reqBody.checkInTime}','${reqBody.isVisit}','${reqBody.visitReason}','${reqBody.checkInLocation}','${reqBody.comment}',${true},${reqBody.id})`;
        return dbQuery.queryRunner(sql);
      } else {
        reject(reject);
      }
    })
    .then(result => {
      resolve({
        code: 200,
        message: "CheckIn succefull."
      });
    })
    .catch(err => {
      reject({
        code: err.code ? err.code : 500,
        message: err.message
      });
    });
});

let checkOut = reqBody => new Promise((resolve, reject) => {
  login.userExists(reqBody.id)
    .then(result => {
      if (result.code == 200) {
        return checkUserIsCheckIn(reqBody.id);
      } else {
        reject(result);
      }
    })
    .then(result => {
      console.log("result------",result,result.length,result.data.isActive);
      
      if (result && result.code == 200 && result.data.isActive == 1) {
        //need to update here createDate
      console.log("CCCCCCC------",result);        
        var sql = `update attendance set checkOutDate='${reqBody.checkOutDate}',checkoutTime='${reqBody.checkoutTime}',
      checkOutLocation='${reqBody.checkOutLocation}',
      comment='${reqBody.comment}',
      isActive=${false} where id=${result.data.id};`;
        return dbQuery.queryRunner(sql);
      } else {
        reject(result);
      }
    })
    .then(result => {
      resolve({
        code: 200,
        message: "Checkout succefully."
      });
    })
    .catch(err => {
      reject({
        code: err.code ? err.code : 500,
        message: err.message
      });
    });
});

module.exports = {
  checkIn: checkIn,
  checkOut: checkOut
}