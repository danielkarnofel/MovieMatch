# 🎬 MovieMatch

MovieMatch is a web application that helps users discover, review, and organize movies. Users can explore trending films, browse by mood, create custom lists, and post ratings and reviews.

## Features

- **Search Movies** – Find movies by title using TMDB's search API.
- **Mood-Based Recommendations** – Browse movie suggestions based on genre-tagged moods.
- **Trending & Popular Lists** – Explore trending and top-rated movies.
- **User Reviews & Ratings** – Leave reviews and star ratings for individual movies.
- **Custom Lists** – Logged-in users can create, edit, and manage personalized movie lists.
- **Dynamic Home Page** – Displays different content for logged-in users (including personalized recommendations).
- **Random Quotes** – Dynamic movie-themed quotes on the homepage via the Quotable API.
- **User Accounts** – Full support for account creation and login.
- **Guest Access** – Many features are accessible without logging in.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (with server-rendered views)
- **Backend:** Node.js, Express
- **Database:** MySQL
- **APIs Used:**
  - [TMDB API](https://www.themoviedb.org/documentation/api) – for movie data
  - [Quotable API](https://github.com/lukePeavey/quotable) – for random quotes

## Database

The app uses a MySQL database to store:

- User information
- Reviews and ratings
- Custom movie lists

Movie data is fetched on-demand from TMDB and is not permanently stored.

> 📊 ERD: _See diagram below_  
<img width="512" height="296" alt="erd" src="https://github.com/user-attachments/assets/982b31ed-4a26-470f-982b-c13c3bc380a4" />

## 🖼 Screenshots

> Coming soon...

## 🛠 Developed For

This was a team project  for **CST 336 – Internet Programming** at **California State University, Monterey Bay (CSUMB)**.

## 🙌 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie data API.
- [Quotable](https://github.com/lukePeavey/quotable) for providing random quotes.
- CSUMB for support and guidance throughout the course.

