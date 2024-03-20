const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride  = require('method-override')



const app = express()

//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

//MongoDb
const MongoURI = 'mongodb://127.0.0.1:27017/gridfs'

//monogo connection
const conn = mongoose.createConnection(MongoURI);

//init gfs
let gfs;

conn.once('open', ()=>{
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

//create storage engine
const storage = new GridFsStorage({
    url:MongoURI,
    file: (req,file)=>{
        return new Promise((resolve, reject)=>{
            crypto.randomBytes(16,(err, buf)=>{
                if(err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename:filename,
                    bucketName: 'uplaods'
                };
                resolve({fileInfo});
            })
        })
    }
})
const upload = multer({storage})


app.get('/', (req,res)=>{
    res.render("index")
});

//route
app.post("/upload", upload.single('file'), (req, res)=>{
    res.redirect('/');
})


const port = 5000;
app.listen(port, ()=>{
    console.log(`server started on port ${port}`)
})