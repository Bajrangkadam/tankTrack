const express = require('express')
const bodyParser = require('body-parser');
//global.moment = require('moment');
const app = express();
const port = 3000
const IPAddress = `127.0.0.1`
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
let registation = require('./src/registration');
let login = require('./src/login');
let attendance = require('./src/attendance');
let leave = require('./src/leave');

process.on("uncaughtException", e => {
  console.log("uncaughtException: " + e);
});

process.on("unhandledRejection", (e) => {
  console.log("unhandledRejection: " + e);
});

app.get('/', (req, res) => res.send('Hello World!'))
app.post('/test', (req, res) => {
  console.log("re---", req.body);

  res.send('Hello World! how are you')
})
app.post('/registation', (req, res) => {
  registation.userRegister(req.body)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});
app.post('/login', (req, res) => {
  login.userLogin(req.body)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});
app.post('/checkin', (req, res) => {
  attendance.checkIn(req.body)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.post('/checkout', (req, res) => {
  attendance.checkOut(req.body)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.get('/getAllAttendanceData', (req, res) => {
  attendance.getAllAttendanceData()
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.get('/getAttendanceBasedOnId/:id', (req, res) => {
  attendance.getAttendanceBasedOnId(req.params.id)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.post('/leaveRequest', (req, res) => {
  leave.leaveRequest(req.body)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.listen(port, () => console.log(`TankTrack listening at http://${IPAddress}:${port}`))