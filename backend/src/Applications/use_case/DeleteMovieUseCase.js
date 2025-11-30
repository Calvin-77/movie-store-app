const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class DeleteMovieUseCase {
    constructor({ movieRepository, userRepository }) {
        this._movieRepository = movieRepository;
        this._userRepository = userRepository;
    }

    async execute(useCasePayload) {
        const { userId, movieId } = useCasePayload;
        
        const isAdmin = await this._userRepository.isAdmin(userId);
        if (!isAdmin) {
            throw new AuthorizationError('Anda tidak memiliki akses untuk menghapus movie');
        }

        await this._movieRepository.deleteMovie(movieId);
    }
}

module.exports = DeleteMovieUseCase;