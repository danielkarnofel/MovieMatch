const searchInput = document.querySelector('#searchInput');
const searchButton = document.querySelector('#searchButton');
const resultsList = document.querySelector('#resultsList');

searchInput.addEventListener('keydown', e => {
	if (e.key === 'Enter') searchMovie(e);
});
searchButton.addEventListener('click', searchMovie);

async function searchMovie(e) {
	e.preventDefault();

	const query = searchInput.value.trim();
	if (!query) return;

	resultsList.innerHTML = '<p>Loading...</p>';
	try {
		const res = await fetch(`/api/search/${encodeURIComponent(query)}`);
		const data = await res.json();

		if (!data.results || data.results.length === 0) {
			resultsList.innerHTML = '<p>No results found.</p>';
			return;
		}

		const listOptions = [`<option value="">Select List</option>`];
		for (const list of userLists) {
			listOptions.push(`<option value="${list.id}">${list.name}</option>`);
		}
		resultsList.innerHTML = '';
		for (const movie of data.results) {
			const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/img/default.jpg';
			resultsList.innerHTML += `
				<a href="/movie/${movie.id}" class="search-result-item">
					<img src="${poster}" alt="${movie.title}">
					<h5>${movie.title}</h5>
					<p>${movie.overview || 'No description available.'}</p>
				</div>
			`;
			if (loggedIn) {
				resultsList.innerHTML += `
					<div class="search-result-input">
						<form action="/api/list/add/${movie.id}" method="POST">
							<input type="hidden" name="movieTitle" value="${movie.title}">
							<select name="listId" required>${listOptions.join('')}</select>
							<button class="btn" type="submit">Add to List</button>
						</form>
					</div>
				`;
			}
		}

    resultsList.style.display = "flex";

	} catch (err) {
		console.error(err);
		resultsList.innerHTML = '<p>Error fetching data</p>';
	}
}