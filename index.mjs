import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

// setting up database connection pool
const pool = mysql.createPool({
    host: "danielkarnofel.tech",
    user: "danielk1_webuser",
    password: "CSUMB-cst336",
    database: "danielk1_moviematch",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();

//routes
app.get('/', (req, res) => {
   res.render('index');
});

app.get("/dbTest", async(req, res) => {
    const sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});

app.get("/apiTest", async(req, res) => {
    const apiKey = `715c996185f334cb145e6bc6b7859540`;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&query=test`;
    const response = await fetch(url);
    const data = await response.json();
    res.send(data);
});

app.listen(3000, ()=>{
    console.log("Express server running")
})