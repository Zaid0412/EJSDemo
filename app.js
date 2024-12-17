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

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;

        // Insert the image into the database
        const query = "INSERT INTO imgs2 (filename, data) VALUES ($1, $2)";
        await pool.query(query, [originalname, buffer]);

        console.log('Image uploaded to database!');
        res.redirect('/');
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image');
    }
});

app.get("/", async (req, res) => {
    try {
        const query = "SELECT id, filename, encode(data, 'base64') AS image FROM imgs2";
        const result = await pool.query(query);

        // Convert image data to base64
        const imageFiles = result.rows.map(row => ({
            id: row.id,
            filename: row.filename,
            src: `data:image/jpeg;base64,${row.image}` // Adjust content type if necessary
        }));

        res.render("index", { imageFiles });
    } catch (error) {
        console.error('Error retrieving images:', error);
        res.status(500).send('Error retrieving images');
    }
});


app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`)
})
