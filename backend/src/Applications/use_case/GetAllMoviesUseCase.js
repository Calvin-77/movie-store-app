const GetMovies = require("../../Domains/movies/entities/GetMovies");

class GetAllMoviesUseCase {
    constructor({ movieRepository }) {
        this._movieRepository = movieRepository;
    }

    async execute() {
        const movies = await this._movieRepository.getAllMovies();
        
        return movies.map(movie => new GetMovies({...movie}));
    }
}

module.exports = GetAllMoviesUseCase;