import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcrypt';


const app = express();
const apiKey = `715c996185f334cb145e6bc6b7859540`;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret: 'moviematch123',
    resave: false,
    saveUninitialized: false
}));

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

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.userId;
  res.locals.username = req.session.username;
  next();
});

/* Home */
/****************************************************************************************************/

app.get('/', async (req, res) => {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    res.render('index', {
        popularMovies: data,
        isAuthenticated: req.session.userId
    });
});

/* Profile*/
/****************************************************************************************************/

app.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const sql = 'SELECT username, email FROM users WHERE id = ?';
  const [rows] = await pool.query(sql, [req.session.userId]);

  if (rows.length === 0) {
    return res.redirect('/logout'); 
  }

  const { username, email } = rows[0];
  res.render('profile', { username, email });
});

/* Login/signup */
/****************************************************************************************************/

// Show login page
app.get('/login', (req, res) => {
    res.render('login', { isAuthenticated: req.session.userId, error: undefined });
});

// Handle login logic
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ?`;
    const [rows] = await pool.query(sql, [username]);

    if (rows.length > 0) {
        const user = rows[0];
        const match = await bcrypt.compare(password, user.userPassword);

        if (match) {
            req.session.userId = user.id;
            req.session.username = user.username;
            return res.redirect('/');
        }
    }

    res.render('login', { isAuthenticated: false, error: 'Invalid username or password' });
});

// Show signup page
app.get('/signUp', (req, res) => {
    res.render('signUp', { error: undefined });
});

// Handle signup logic
app.post('/signup', async (req, res) => {
    const { username, password, confirm } = req.body;
    const email = `${username}@moviematch.fake`; // do w want a real email?

    if (password != confirm) {
        // TODO: Throw some kind of error here
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (username, userPassword, email) VALUES (?, ?, ?)`;
        await pool.query(sql, [username, hash, email]);

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('signUp', { error: 'Username or email already exists.' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

/* Test routes */
/****************************************************************************************************/

app.get("/dbTest", async(req, res) => {
    const sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});

app.get("/apiTest", async(req, res) => {
    
    // This provides API configuration info like query parameters and image sizes
    // const url = `https://api.themoviedb.org/3/configuration?api_key=${apiKey}&query=test`;

    // List of genres
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&query=test`;

    const response = await fetch(url);
    const data = await response.json();
    res.send(data);
});

/****************************************************************************************************/

app.listen(3000, ()=>{
    console.log("Express server running")
}) 

// clean up after shutdown
process.on('SIGINT', async () => {
    try {
        console.log('\nShutting down server...');
        await pool.end();  // Close MySQL pool
        console.log('Database pool closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error closing the database pool:', err);
        process.exit(1);
    }
});