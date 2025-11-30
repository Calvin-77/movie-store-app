const MovieDetails = require("../../Domains/movies/entities/MovieDetails");

class GetMovieDetailsUseCase {
    constructor({ movieRepository, transactionRepository }) {
        this._movieRepository = movieRepository;
        this._transactionRepository = transactionRepository;
    }

    async execute(useCasePayload) {
        const { movieId, userId } = useCasePayload;

        const movie = await this._movieRepository.getMovieDetails(movieId);
        const owned = userId ? await this._transactionRepository.checkUserOwnership(userId, movieId) : false;

        return new MovieDetails({...movie, owned});
    }
}

module.exports = GetMovieDetailsUseCase;