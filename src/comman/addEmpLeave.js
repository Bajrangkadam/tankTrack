let async = require('async');
let dbQuery = require('../../dbConfig/queryRunner');


let getWeekOff = (day1, day2) => new Promise((resolve, reject) => {
  console.log("d=====", day1, day2);

  var d = new Date();
  var getTot = daysInMonth(d.getMonth(), d.getFullYear()); //Get total days in a month
  var day1Array = new Array(),
    day2Array = new Array();

  for (var i = 1; i <= getTot; i++) {    //looping through days in month
    var newDate = new Date(d.getFullYear(), d.getMonth(), i)
    if (day1 != null) {
      if (newDate.getDay() == day1) {   //if Sunday
        day1Array.push(i);
      }
    }

    if (day2 != null) {
      if (newDate.getDay() == day2) {   //if Sunday
        day2Array.push(i);
      }
    }
  }
  console.log("sat", day1Array);
  console.log("sun", day2Array);
  resolve({
    day1Array: day1Array,
    day2Array: day2Array,
    month: d.getMonth() + 1
  });
  function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }
});
let updateEmpLeaveMaster = empData => new Promise((resolve, reject) => {
  async.eachSeries(empData, (val, outCb) => {
    if (val.wod.length != 1) {
      let week = val.wod.split(",");
      getWeekOff(parseInt(week[0] - 1), parseInt(week[1] - 1))
        .then(result => {
          console.log("result===", result);
          let sql = `INSERT INTO leave_emp_master(comp_off,paid,unpaid,week_off,month,empid)
          value(${0},${1.5},${0},${result.day1Array.length + result.day1Array.length}, ${result.month},${val.id})`;
          return dbQuery.queryRunner(sql)
        })
        .then(result =>{
          console.log("result=======",result);          
          outCb();
        })
        .catch(err => {
          console.log("err====",err);          
          outCb();
        })
    } else {
      return getWeekOff(parseInt(val.wod[0] - 1), null)
      .then(result => {
        console.log("result===", result);
        let sql = `INSERT INTO leave_emp_master(comp_off,paid,unpaid,week_off,month,empid)
        value(${0},${1.5},${0},${result.day1Array.length + result.day1Array.length}, ${result.month},${val.id})`;
        return dbQuery.queryRunner(sql)
      })
      .then(result =>{
        console.log("result=======",result);          
        outCb();
      })
      .catch(err => {
        console.log("err====",err);          
        outCb();
      })
    }
  });
});

let addMonthLeave = () => new Promise((resolve, reject) => {
  let sql = `select * from emp_master where isActive=1`;
  dbQuery.queryRunner(sql)
    .then(result => {
      if (result && result.length != 0) {
        console.log("result====", result);
        return updateEmpLeaveMaster(result);
      } else {
        console.log("Data not found.");
      }
    })
    .then(result => {
      console.log("result-------", result);

    })
    .catch(err => {
      console.log("catch===>", err);
    });


  //let sql=``
});

addMonthLeave();