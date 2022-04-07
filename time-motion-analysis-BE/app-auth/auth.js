const express = require('express');
const config = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const DB = require('./db');

const db = new DB("sqlitedb")
const app = express();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain)



router.post('/register', function(req, res) {
    console.log("[INFO]Start the register process!")
    console.log(req.body.name, req.body.email, req.body.password)
    db.insert([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8)
    ],
    function (err) {
        if (err) return res.status(500).send("There was a problem registering the user.")
        db.selectByEmail(req.body.email, (err,user) => {
            if (err) return res.status(500).send("There was a problem getting user")
            let token = jwt.sign({ id: user.id }, config.secret, {expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ auth: true, token: token, user: user });
        });
    });
});

router.post('/test1', (req, res) => {
    console.log("[INFO]Start the login process!")
    console.log(req.body.userName, req.body.password)
    db.selectByEmail(req.body.userName, (err, user) => {
        if (err) return res.status(
            500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.user_pass);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: user });
    });
})

// send count information to frontend server
router.get('/classification-count', (req, res) => {
    console.log("[INFO]Send classification counts");
    console.log(req.query.userid);
    db.classificationCountsPerUser(req.query.userid, (err, response) => {
        // console.log(response);
        if (err) return res.status(
            500).send('Error on the server.');
        if (!response) return res.status(404).send('No user found.');
        res.status(200).send({ response: response });
    });
})

// send count information to frontend server
router.get('/lean-classification-count', (req, res) => {
    console.log("[INFO]Send lean classification counts");
    console.log(req.query.userid);
    db.leanClassificationCountsPerUser(req.query.userid, (err, response) => {
        // console.log(response);
        if (err) return res.status(
            500).send('Error on the server.');
        if (!response) return res.status(404).send('No user found.');
        res.status(200).send({ response: response });
    });
})


app.use(router)
let port = process.env.PORT || 3000;
let server = app.listen(port, function() {
    console.log('Express server listening on port ' + port)
});
