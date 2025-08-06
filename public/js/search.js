
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');

const searchResults = document.querySelector('.search-result-list');
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

// searchInput.addEventListener('keydown', (e) => {
//     if (e.key === 'Enter') {
//         searchMovie(e);
//     }
// }); 
searchButton.addEventListener('click', searchMovie);

async function searchMovie(event) {

    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) return;

    if (searchResults.classList.contains(`d-none`)) searchResults.classList.remove(`d-none`);

    searchResults.innerHTML = '<p>Loading search information...</p>';

    try {
        const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
        const movies = await response.json();

        if (!movies.results || movies.results.length === 0) {
            searchResults.innerHTML = '<p>No results found.</p>';
            return;
        }

        let html = '';

        for (const movie of movies.results) {
            const poster = movie.backdrop_path?.trim() ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : '/img/default.jpg';

            html += `
                    <a href="/movie" class="search-result-item">
                        <h2>${movie.original_title}</h2>
                        <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                        <p><strong>Adult Content:</strong> ${movie.adult ? 'Yes' : 'No'}</p>
                        <p><strong>Language:</strong> ${languageNames.of(movie.original_language)}</p>
                        <p><strong>Average Vote:</strong> ${movie.vote_average || 'N/A'}</p>
                        <img src="${poster}" alt="${movie.original_title}">
                        <p><strong>Overview:</strong> ${movie.overview || 'No overview available.'}</p>
                    </a>
                    `;
        }

        searchResults.innerHTML = html;
        document.querySelector('.search-result-list').style.display = "block";

    } catch (error) {
        console.error('Error fetching movie data:', error);
        searchResult.innerHTML = '<p>An error occurred. Please try again later.</p>';
    }
}