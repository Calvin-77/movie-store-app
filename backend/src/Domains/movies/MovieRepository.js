class MovieRepository {
    async getMovieDetails(id) {
        throw new Error('MOVIE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async addMovie(movieDetails) {
        throw new Error('MOVIE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getAllMovies() {
        throw new Error('MOVIE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async updateMovie(id, movieDetails) {
        throw new Error('MOVIE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async deleteMovie(id) {
        throw new Error('MOVIE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = MovieRepository;