const express = require('express');
const config = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const port = 3000

const DB = require('./db');

const db = new DB("sqlitedb")
const app = express();
// const {spawn} = require('child_process');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain)
app.use(express.static('public'))
app.use(fileUpload());


var readVideoInfo= (req, res) => {
    console.log('[INFO] Backend read Video Info prcoess started!');
    const myFile = req.files.file;

    // const python = spawn('python', ['./get_data.py']);
    const python = spawn('python', ['./video_process.py', myFile.name]);
    python.stdout.on('data', function (data) {
        console.log('[INFO]Pipe data from python video_process script ...');
        res.json(JSON.parse(data.toString()));
    });
}

var ClassifyImg = (req, res, dataUrl) => {
    console.log('[INFO]Backend Classify Img prcoess started!');
    const myFile = req.files.file;
    const python = spawn('python', ['./image_classification.py', myFile.name]);
    python.stdout.on('data', function (data) {
        console.log('[INFO]Pipe data from python image_classification script ...');
        // res.json(JSON.parse(data.toString()));
        res.json({serverUrl: `${dataUrl}`, imgInfo: JSON.parse(data.toString())});
    });
}



app.post('/register', function(req, res) {
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

app.post('/test1', (req, res) => {
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
app.get('/classification-count', (req, res) => {
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
app.get('/lean-classification-count', (req, res) => {
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

app.post('/uploadVideo', (req, res) => {
    console.log("[INFO]Get ready to recieve files!")
    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }

    const myFile = req.files.file;
    console.log("[INFO]Receiving files!")
    console.log("[INFO]File name:", myFile.name)
    const prePath =  "C:\Users\Xuyong Yu\Desktop\Github\OPTIMO-Express-server"
    // Use the mv() method to place the file somewhere on your server
    myFile.mv(`${__dirname}/public/${myFile.name}`, function (err) {
    // console.log(`C:/Users/Xuyong Yu/Desktop/Github/OPTIMO-Express-server${__dirname}/public/${myFile.name}`)
    // myFile.mv(`C:/Users/Xuyong Yu/Desktop/Github/OPTIMO-Express-server${__dirname}/public/${myFile.name}`, function (err) {
        console.log('[INFO]mv callback')
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "[ERR]there is error" });
        }
        res.send({ file: myFile.name, path: `/${myFile.name}`, ty: myFile.type });
        // readVideoInfo(req, res);
    });
})

app.post('/uploadImg', (req, res) => {
    console.log("[INFO]Get ready to recieve CLASSIFICATION files!")
    if (!req.files) {
        return res.status(500).send({ msg: "[ERR]File not found" })
    }

    const myFile = req.files.file;
    console.log("[INFO]Receiving CLASSIFICATION files!")
    console.log("[INFO]File name:", myFile.name)

    // Use the mv() method to place the file somewhere on your server
    myFile.mv(`${__dirname}/public/${myFile.name}`, function (err) {
        console.log('[INFO]mv callback')
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "[ERR]there is error" });
        }
        
        fs.readFile(
            './public/' + myFile.name, 'base64', 
            (err, base64Image) => {
                const dataUrl = `data:image/jpeg;base64, ${base64Image}`
                ClassifyImg(req, res, dataUrl);
                // return res.send(`${dataUrl}`);
            }
        )
    });
})


app.listen(port, () => {
    console.log(`server is listening at port ${port}`);
})
