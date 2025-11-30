const { nanoid } = require('nanoid');

class AddMovieUseCase {
    constructor({ movieRepository, userRepository }) {
        this._movieRepository = movieRepository;
        this._userRepository = userRepository;
    }

    async execute(useCasePayload) {
        const { userId, title, synopsis, price, year, video, image } = useCasePayload;
        const isAdmin = await this._userRepository.isAdmin(userId);
        if (!isAdmin) {
            throw new Error('FORBIDDEN_ACCESS');
        }

        const imageBuffer = image ? Buffer.from(image, 'base64') : null;
        const result = await this._movieRepository.addMovie({ title, synopsis, price, year, video, image: imageBuffer });

        return result;
    }
}

module.exports = AddMovieUseCase;