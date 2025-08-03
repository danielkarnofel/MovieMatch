const searchButton = document.querySelector(`#searchButton`);
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

searchButton.addEventListener(`click`, searchMovie);

async function searchMovie(event) {
    event.preventDefault();

    const searchInput = document.querySelector(`#searchInput`);
    const url = `/api/search/${searchInput.value}`;

    try {
        let response = await fetch(url);
        let movies = await response.json();

        let searchResult = document.querySelector('#results');

        searchResult.innerHTML = '<p>Loading search information...</p>';

        for (let i = 0; i < movies.results.length; i++) {

            let poster = movies.results[i].backdrop_path && movies.results[i].backdrop_path.trim() !== "" ? 
                            `https://image.tmdb.org/t/p/w500${movies.results[i].backdrop_path}` : 
                            '/img/default.jpg';

            let movieInfo = `
            <div class="col-md-4 mb-4 d-flex">
                <div class="card d-flex flex-column h-100 w-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div class="d-flex flex-column" style="flex: 1; padding-right: 20px;">
                                <h5 class="card-title"> ${movies.results[i].original_title} </h5>
                                <p class="card-text">
                                    <strong>Release Date:</strong> ${movies.results[i].release_date} <br>
                                    <strong>Adult Content:</strong> ${movies.results[i].adult === false ? 'No' : 'Yes'} <br>
                                    <strong>Language:</strong> ${languageNames.of(movies.results[i].original_language)} <br>
                                    <strong>Average Vote:</strong> ${movies.results[i].vote_average} <br>
                                </p>
                            </div>

                            <img src="${poster}" alt="${movies.results[i].original_title}" class="img-fluid" style="max-width: 160px; height: auto;">
                        </div>

                        <div class="mt-3">
                            <strong>Overview:</strong>
                            <p class="card-text">${movies.results[i].overview}</p>
                        </div>
                    </div>
                </div>
            </div>`;

            if (i === 0) {
                searchResult.innerHTML = `<hr style="margin-top: 20px;">`
            }
                
            searchResult.innerHTML += `${movieInfo}`;
            
        }

    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}