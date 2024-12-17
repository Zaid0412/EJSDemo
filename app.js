require('dotenv').config()
const multer = require('multer')
const express = require('express')
const path = require("node:path");
const { Pool } = require('pg')
const fs = require('fs')
const app = express()
const PORT = process.env.PORT

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.DATABASE_PORT,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage })

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const getAllImgs = () => {
    const imageDir = path.join(__dirname, "public", "images");
    fs.readdir(imageDir, (err, files) => {
        // Filter only image files (jpg, png, etc.)
        const imageFiles = files.filter((file) =>
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
        );

        // res.json(imageFiles); // Send the list of image file names as JSON
        console.log(imageFiles)
        return files
    });
}


app.get('/upload', (req, res) => {
    res.render('upload')
})

app.post('/upload', upload.single('image'), (req, res) => {
    console.log('Image Uploaded!')
    res.redirect('/')
})

app.get("/", (req, res) => {
    const imageDir = path.join(__dirname, "public", "images");
    fs.readdir(imageDir, (err, files) => {
        // Filter only image files (jpg, png, etc.)
        let imageFiles = files.filter((file) =>
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
        );

        imageFiles = imageFiles.map(img => `/images/${img}`)
        // res.json(imageFiles); // Send the list of image file names as JSON
        res.render("index", { imageFiles })
        console.log(imageFiles)
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`)
})
