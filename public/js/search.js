const searchButton = document.querySelector('#searchButton');
const searchInput = document.querySelector('#searchInput');
const searchResultList = document.querySelector('#resultsList');
const searchResult = document.querySelector('#results');
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

searchButton.addEventListener('click', searchMovie);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchMovie(e);
    }
});

async function searchMovie(event) {
    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) return;

    if (searchResultList.classList.contains(`d-none`)) {
        searchResultList.classList.remove(`d-none`);
    }

    searchResult.innerHTML = '<p class="text-info">Loading search information...</p>';

    try {
        const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
        const movies = await response.json();

        if (!movies.results || movies.results.length === 0) {
            searchResult.innerHTML = '<p class="text-warning">No results found.</p>';
            return;
        }

        let html = '';

        for (const movie of movies.results) {
            const poster = movie.backdrop_path?.trim()
                ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                : '/img/default.jpg';

            html += `
            <div class="col-md-4 mb-4 d-flex">
                <div class="card bg-dark text-secondary w-100 h-100 d-flex flex-column">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div class="flex-grow-1 pe-3">
                                <h5 class="card-title">${movie.original_title}</h5>
                                <p class="card-text">
                                    <strong>Release Date:</strong> ${movie.release_date || 'N/A'}<br>
                                    <strong>Adult Content:</strong> ${movie.adult ? 'Yes' : 'No'}<br>
                                    <strong>Language:</strong> ${languageNames.of(movie.original_language)}<br>
                                    <strong>Average Vote:</strong> ${movie.vote_average || 'N/A'}
                                </p>
                            </div>
                            <img src="${poster}" alt="${movie.original_title}" class="img-fluid" style="max-width: 160px; height: auto;">
                        </div>
                        <div class="mt-3">
                            <strong>Overview:</strong>
                            <p class="card-text">${movie.overview || 'No overview available.'}</p>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        searchResult.innerHTML = html;

    } catch (error) {
        console.error('Error fetching movie data:', error);
        searchResult.innerHTML = '<p class="text-danger">An error occurred. Please try again later.</p>';
    }
}