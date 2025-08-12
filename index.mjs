import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import path from 'path';

const app = express();
const apiKey = `715c996185f334cb145e6bc6b7859540`;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

/* Session setup */
/****************************************************************************************************/
app.use(session({
    secret: 'moviematch123',
    resave: false,
    saveUninitialized: false
}));

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

/* Database connection */
/****************************************************************************************************/
const pool = mysql.createPool({
    host: "danielkarnofel.tech",
    user: "danielk1_webuser",
    password: "CSUMB-cst336",
    database: "danielk1_moviematch",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();

/* Home View */
/****************************************************************************************************/
app.get('/', async (req, res) => {

    // Get trending movies
    const urlTrending = `https://api.themoviedb.org/3/trending/movie/day?page=1&&api_key=${apiKey}`;
    const responseTrending = await fetch(urlTrending);
    const trendingData = await responseTrending.json();

    // Get popular movies
    const urlPopular = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
    const responsePopular = await fetch(urlPopular);
    const popularData = await responsePopular.json();

	// Get genre list
    const urlGenres = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
    const responseGenres = await fetch(urlGenres);
    const genresData = await responseGenres.json();

    // Get quote
    const urlQuote = `http://api.quotable.io/quotes/random`;
	const responseQuote = await fetch(urlQuote);
	const quoteData = await responseQuote.json();

    let userLists = [];

    // Get user lists (if logged in)
    if (req.session.authenticated) {

        // Get a list of movies/list_ids that the user has in their lists
        const [listMovies] = await pool.query(`
            SELECT lists.id, lists.name, list_movies.movie_id
            FROM lists
            LEFT JOIN list_movies ON lists.id = list_movies.list_id
            WHERE lists.user_id = ?`, 
            [req.session.userId]
        );

        // Compile each movie into an array of list objects and pull movie data from API
        const listsMap = [];
        for (const listMovie of listMovies) {

            // If first movie in a list, create list entry
            if (!listsMap[listMovie.id]) {
                listsMap[listMovie.id] = {
                    id: listMovie.id,
                    name: listMovie.name,
                    movies: [],
                };
            }

            // Check if list has any movies added first
            if (listMovie.movie_id) { 

                // Pull movie info from API
                const urlMovie= `https://api.themoviedb.org/3/movie/${listMovie.movie_id}?api_key=${apiKey}`;

                // For testing API output
                // https://api.themoviedb.org/3/movie/1?api_key=715c996185f334cb145e6bc6b7859540

                const responseMovie = await fetch(urlMovie);
                const dataMovie = await responseMovie.json();

                // Add movie to the list object
                listsMap[listMovie.id].movies.push({
                    id: dataMovie.id,
                    title: dataMovie.title,
                    poster: dataMovie.poster_path,
                });
            }
        }
        userLists = Object.values(listsMap);
    }
    
    res.render('index', {
        loggedIn: !!req.session.authenticated,
        trendingData,
        popularData,
        genresData,
        quoteData,
        userLists
    });
});

/* Search View */
/****************************************************************************************************/
app.get('/search', async (req, res) => {
    const [userLists] = await pool.query('SELECT * FROM lists WHERE user_id = ?', [req.session.userId]);

    const flash = req.session.flash;
	delete req.session.flash;

    res.render('search', {
        loggedIn: !!req.session.authenticated,
        userLists,
    });
});

app.get('/api/search/:query', async (req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${req.params.query}&api_key=${apiKey}`;
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

/* Profile View */
/****************************************************************************************************/
app.get('/profile', async (req, res) => {
    const [userLists] = await pool.query('SELECT * FROM lists WHERE user_id = ?', [req.session.userId]);

    const flash = req.session.flash;
	delete req.session.flash;

    res.render('profile', {
        userLists
    });
});

app.post('/api/lists/create', isAuthenticated, async (req, res) => {
    
    try {
        const { name, description } = req.body;
        if (!name) return res.redirect('/profile');

        await pool.query('INSERT INTO lists (user_id, name, description) VALUES (?, ?, ?)', [
            req.session.userId, name, description
        ]);

        req.session.flash = "List created!";
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.post('/api/lists/delete/:id', isAuthenticated, async (req, res) => {
    try {
        await pool.query('DELETE FROM lists WHERE list_id = ? AND user_id = ?', [req.params.id, req.session.user_id]);
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* List View */
/****************************************************************************************************/
app.get('/list/:listId', isAuthenticated, async (req, res) => {
	const [list] = await pool.query('SELECT * FROM lists WHERE id = ?', [req.params.listId]);
	const [listMovies] = await pool.query('SELECT * FROM list_movies WHERE list_id = ?', [req.params.listId]);

    list[0].movies = [];

    for (const movie of listMovies) {
        // Pull movie info from API
        const urlMovie= `https://api.themoviedb.org/3/movie/${movie.movie_id}?api_key=${apiKey}`;
        const responseMovie = await fetch(urlMovie);
        const dataMovie = await responseMovie.json();
        list[0].movies.push({
            id: dataMovie.id,
            title: dataMovie.title,
            poster: dataMovie.poster_path,
            overview: dataMovie.overview,
        });
    }

    const flash = req.session.flash;
	delete req.session.flash;

    res.render('list', {
        list: list[0],
    });
});

app.post('/api/list/add/:id', isAuthenticated, async (req, res) => {
    try {
        const { listId, movieTitle } = req.body;

        if (isNaN(listId)) {
            req.session.flash = "Invalid form submission.";
            return res.redirect('/search');
        }

        const sql = `INSERT INTO list_movies (list_id, movie_id) VALUES (?, ?)`;
        await conn.query(sql, [listId, req.params.id]);

        req.session.flash = `"${movieTitle}" added to your list!`;
        res.redirect('/search');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.post('/api/list/remove/:id', isAuthenticated, async (req, res) => {
    try {
        const { listId, movieTitle } = req.body;

        await pool.query('DELETE FROM list_movies WHERE list_id = ? AND movie_id = ?', [listId, req.params.id]);

        req.session.flash = `"${movieTitle}" removed from your list!`;
        res.redirect(`/list/${listId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* Mood View */
/****************************************************************************************************/
app.get('/mood/:moodId/:moodName', async (req, res) => {

    // Get genre list
    const urlGenre = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${req.params.moodId}`;
    const responseGenre = await fetch(urlGenre);
    const dataGenre = await responseGenre.json();

    const flash = req.session.flash;
	delete req.session.flash;

    res.render('mood', {
        loggedIn: !!req.session.authenticated,
        genreName: req.params.moodName,
        dataGenre,
    });
});

/* Movie View */
/****************************************************************************************************/
app.get('/movie/:movieId', async (req, res) => {
    const urlMovie = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${apiKey}`;
    const responseMovie = await fetch(urlMovie);
    const dataMovie = await responseMovie.json();

    const [reviews] = await pool.query('SELECT * FROM reviews WHERE movie_id = ?', [req.params.movieId]);
    const [users] = await pool.query('SELECT id, username FROM reviews NATURAL JOIN users ');
    const flash = req.session.flash;
	delete req.session.flash;

    res.render('movie', {
        loggedIn: !!req.session.authenticated,
        dataMovie,
        reviews,
        users,
    });
});

app.post('/api/reviews/add/:id', isAuthenticated, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const sql = `INSERT INTO reviews (user_id, movie_id, rating, content) VALUES (?, ?, ?, ?)`;
        await conn.query(sql, [req.session.userId, req.params.id, rating, comment]);

        res.redirect(`/movie/${req.params.id}`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/* Login and Signup */
/****************************************************************************************************/

app.get('/login', (req, res) => {
    res.render('login', { isAuthenticated: req.session.userId, error: undefined });
});

app.post('/login', async (req, res) => {

    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.authenticated = true;
            return res.redirect('/');
        }
    }
    res.render('login', { isAuthenticated: false, error: 'Invalid username or password' });
});

app.get('/signUp', (req, res) => {
    res.render('signUp', { error: undefined });
});

app.post('/signup', async (req, res) => {

    const { username, password, confirm } = req.body;

    if (password !== confirm) {
        return res.render('signUp', { error: 'Passwords do not match.' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('signUp', { error: 'Username or email already exists.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

/* Startup and Shutdown */
/****************************************************************************************************/

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