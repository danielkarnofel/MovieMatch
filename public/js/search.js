const searchButton = document.querySelector('#searchButton');
const searchInput = document.querySelector('#searchInput');
const resultsContainer = document.querySelector('#resultsList');
const results = document.querySelector('#results');

searchButton.addEventListener('click', searchMovie);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchMovie(e);
});

async function searchMovie(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  resultsContainer.classList.remove('d-none');
  results.innerHTML = '<p>Loading...</p>';

  try {
    const res = await fetch(`/api/search/${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      results.innerHTML = '<p>No results found.</p>';
      return;
    }

    results.innerHTML = data.results.map(movie => {
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/img/default.jpg';
      const options = userLists.map(list =>
        `<option value="${list.list_id}">${list.list_name}</option>`
      ).join('');

      return `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${poster}" alt="${movie.title}" class="card-img-top">
            <div class="card-body">
              <h5>${movie.title}</h5>
              <p>${movie.overview || 'No description available.'}</p>
              <form action="/api/movie/list" method="POST">
                <input type="hidden" name="movieTitle" value="${movie.title}">
                <input type="hidden" name="posterUrl" value="${poster}">
                <input type="hidden" name="description" value="${movie.overview}">
                <select name="listId" required class="form-select mb-2">${options}</select>
                <button type="submit" class="btn btn-sm btn-primary">Add to List</button>
            </form>

            </div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error(err);
    results.innerHTML = '<p>Error fetching data</p>';
  }
}
