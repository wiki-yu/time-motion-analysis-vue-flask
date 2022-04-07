const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');

const app = express();
const {spawn} = require('child_process');

// middle ware
app.use(express.static('public'))
app.use(cors())
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


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


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

app.listen(4000, () => {
    console.log('server is listening at port 4000');
})