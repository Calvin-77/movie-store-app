const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class UpdateMovieUseCase {
    constructor({ movieRepository, userRepository }) {
        this._movieRepository = movieRepository;
        this._userRepository = userRepository;
    }

    async execute(useCasePayload) {
        const { userId, movieId, title, synopsis, price, year, video, image } = useCasePayload;
        
        const isAdmin = await this._userRepository.isAdmin(userId);
        if (!isAdmin) {
            throw new AuthorizationError('Anda tidak memiliki akses untuk mengupdate movie');
        }

        await this._movieRepository.updateMovie(movieId, {
            title, synopsis, price, year, video, image
        });
    }
}

module.exports = UpdateMovieUseCase;