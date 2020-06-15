const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
let registation = require('./src/registration');
let login = require('./src/login');
let attendance = require('./src/attendance');

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/test', (req, res) => res.send('Hello World! how are you'))
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
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))