import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcryptjs';

const app = express();
const apiKey = `715c996185f334cb145e6bc6b7859540`;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'moviematch123',
  resave: false,
  saveUninitialized: false
}));

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

function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    res.redirect('/login');
  } else {
    next();
  }
}

/* Home */
app.get('/', async (req, res) => {
  const urlGenre = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
  const urlPopularMovies = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
  const responsePopularMovies = await fetch(urlPopularMovies);
  const dataPopularMovies = await responsePopularMovies.json();
  const responseGenre = await fetch(urlGenre);
  const dataGenre = await responseGenre.json();

  if (!req.session.authenticated) {
    const max = 20;
    const count = 6;
    const usedIndices = new Set();

    while (usedIndices.size < count) {
        const randIndex = Math.floor(Math.random() * max);
        usedIndices.add(randIndex);
    }
    const randomIndices = Array.from(usedIndices);

    const shuffled = dataGenre.genres.sort(() => 0.5 - Math.random());
    const moods = shuffled.slice(0, 4);

    res.render('indexlo', {
      popularMovies: dataPopularMovies,
      moods, randomIndices
    });
  } else {
    const [userListsWithMovies] = await pool.query(`
      SELECT cl.list_id, cl.list_name, lm.movie_title, lm.poster_url
      FROM custom_lists cl
      LEFT JOIN list_movies lm ON cl.list_id = lm.list_id
      WHERE cl.user_name = ?
    `, [req.session.username]);
    const quoteAPI = `http://api.quotable.io/quotes/random`;

    const response = await fetch(quoteAPI);
    const data = await response.json();

    if (data.length === 0) {
        return res.status(404).json({ error: "No quotes found." });
    }

    const quote = {content: data[0].content, author: data[0].author};

    res.render('index', {
      popularMovies: dataPopularMovies,
      userListsWithMovies,
      quoteOfTheDay: quote
    });
  }
});

/* Profile */
app.get('/profile', isAuthenticated, async (req, res) => {
  const [userInfo] = await pool.query('SELECT username, email FROM users WHERE id = ?', [req.session.userId]);
  const [userLists] = await pool.query('SELECT * FROM custom_lists WHERE user_name = ?', [req.session.username]);

  if (userInfo.length === 0) return res.redirect('/logout');

  const flash = req.session.flash;
  delete req.session.flash;

  res.render('profile', {
    username: userInfo[0].username,
    email: userInfo[0].email,
    userLists,
    flash
  });
});

/* Search */
app.get('/search', isAuthenticated, async (req, res) => {
  const [userLists] = await pool.query('SELECT list_id, list_name FROM custom_lists WHERE user_name = ?', [req.session.username]);
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('search', { userLists, flash });
});

/* Create List */
app.post('/api/lists', isAuthenticated, async (req, res) => {
  try {
    const { list_name, description } = req.body;
    if (!list_name) return res.redirect('/profile');

    await pool.query('INSERT INTO custom_lists (user_name, list_name, description) VALUES (?, ?, ?)', [
      req.session.username, list_name, description
    ]);

    req.session.flash = "List created!";
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Delete List */
app.post('/api/lists/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await pool.query('DELETE FROM custom_lists WHERE list_id = ? AND user_name = ?', [
      req.params.id,
      req.session.username
    ]);
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Add Movie to List */
app.post('/api/movie/list', isAuthenticated, async (req, res) => {
  try {
    const { listId, movieTitle, posterUrl, description } = req.body;

    if (isNaN(listId) || !movieTitle || !posterUrl) {
      req.session.flash = "Invalid movie data.";
      return res.redirect('/search');
    }

    const sql = `INSERT INTO list_movies (list_id, movie_title, poster_url, description) VALUES (?, ?, ?, ?)`;
    await conn.query(sql, [listId, movieTitle, posterUrl, description]);

    req.session.flash = `"${movieTitle}" added to your list!`;
    res.redirect('/search');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


/***************************************
 * Remaining routes and API endpoints *
 ***************************************/

/* View List */
app.get('/list/:id', isAuthenticated, async (req, res) => {
  const sql = 'SELECT * FROM list_movies WHERE list_id = ?';
  const [movies] = await pool.query(sql, [req.params.id]);
  res.render('list', { movies });
});

/* Movie Page */
app.get('/movie', (req, res) => {
  const movieTitle = req.query.title || 'Unknown Title';
  const posterUrl = req.query.poster || '';
  const description = req.query.desc || 'No description available.';
  res.render('movie', { movieTitle, posterUrl, description });
});


/* Mood Page */
app.get('/mood', (req, res) => {
  res.render('mood');
});

/* Login */
app.get('/login', (req, res) => {
  res.render('login', { isAuthenticated: req.session.userId, error: undefined });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

  if (rows.length > 0) {
    const user = rows[0];
    const match = await bcrypt.compare(password, user.userPassword);
    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.authenticated = true;
      return res.redirect('/');
    }
  }

  res.render('login', { isAuthenticated: false, error: 'Invalid username or password' });
});

/* Signup */
app.get('/signUp', (req, res) => {
  res.render('signUp', { error: undefined });
});

app.post('/signup', async (req, res) => {
  const { username, password, confirm } = req.body;
  const email = `${username}@moviematch.fake`;

  if (password !== confirm) {
    return res.render('signUp', { error: 'Passwords do not match.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, userPassword, email) VALUES (?, ?, ?)', [username, hash, email]);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('signUp', { error: 'Username or email already exists.' });
  }
});

/* Logout */
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

/* Search API */
app.get('/api/search/:query', isAuthenticated, async (req, res) => {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(req.params.query)}&api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: "No results found." });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Start Server */
app.listen(3000, () => {
  console.log("Express server running");
});

/* Graceful Shutdown */
process.on('SIGINT', async () => {
  try {
    console.log('\nShutting down server...');
    await pool.end();
    console.log('Database pool closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing the database pool:', err);
    process.exit(1);
  }
});