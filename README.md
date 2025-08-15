# 🎬 MovieMatch

MovieMatch is a web application that helps users discover, review, and organize movies. Users can explore trending films, browse by mood, create custom lists, and share their thoughts through ratings and reviews. Whether logged in or just browsing, MovieMatch offers an engaging and personalized movie discovery experience.

## 🌟 Features

- 🔍 **Search Movies** – Find movies by title using TMDB's robust search API.
- 🌈 **Mood-Based Recommendations** – Browse curated movie suggestions based on genre-tagged moods.
- 📈 **Trending & Popular Lists** – Explore the latest trending and top-rated movies.
- 📝 **User Reviews & Ratings** – Leave reviews and star ratings for individual movies.
- 📂 **Custom Lists** – Logged-in users can create, edit, and manage personalized movie lists.
- ✨ **Dynamic Home Page** – Displays different content for logged-in users (including personalized recommendations).
- 💬 **Random Quotes** – Enjoy dynamic movie-themed quotes on the homepage via the Quotable API.
- 🔐 **User Accounts** – Full support for account creation and login.
- 👀 **Guest Access** – Many features are accessible without logging in.

## 🧰 Tech Stack

- **Frontend:** HTML, CSS, JavaScript (with server-rendered views)
- **Backend:** Node.js, Express
- **Database:** MySQL
- **APIs Used:**
  - [TMDB API](https://www.themoviedb.org/documentation/api) – for movie data
  - [Quotable API](https://github.com/lukePeavey/quotable) – for random quotes

## 🗂 Database

The app uses a MySQL database to store:

- User information
- Reviews and ratings
- Custom movie lists

Movie data is fetched on-demand from TMDB and is not permanently stored.

> 📊 ERD: _See diagram below_  
> ![ERD Diagram](./assets/erd.png) <!-- Replace with your actual path -->

## 🖼 Screenshots

> Include screenshots of your app’s key pages below:

- Home Page  
  ![Home](./assets/home.png)

- Movie Page  
  ![Movie](./assets/movie.png)

- Custom List  
  ![List](./assets/list.png)

## 🛠 Developed For

This project was created by a team (including [Your Name]) as the final project for **CST 336 – Internet Programming** at **California State University, Monterey Bay (CSUMB)**.

## 🙌 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie data API.
- [Quotable](https://github.com/lukePeavey/quotable) for providing random quotes.
- CSUMB for support and guidance throughout the course.

