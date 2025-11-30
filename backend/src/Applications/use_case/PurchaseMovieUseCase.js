const { nanoid } = require('nanoid');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const PurchaseMovie = require('../../Domains/transactions/entities/PurchaseMovie');

class PurchaseMovieUseCase {
    constructor({ userRepository, movieRepository, transactionRepository }) {
        this._userRepository = userRepository;
        this._movieRepository = movieRepository;
        this._transactionRepository = transactionRepository;
    }

    async execute(useCasePayload) {
        const purchaseMovie = new PurchaseMovie(useCasePayload);
        
        const movie = await this._movieRepository.getMovieDetails(purchaseMovie.movieId);
        const user = await this._userRepository.getUserById(purchaseMovie.userId);
        
        if (user.balance < movie.price) {
            throw new InvariantError('saldo tidak mencukupi untuk membeli movie ini');
        }

        const isOwned = await this._transactionRepository.checkUserOwnership(purchaseMovie.userId, purchaseMovie.movieId);
        if (isOwned) {
            throw new InvariantError('movie sudah dimiliki');
        }

        await this._userRepository.updateBalance(purchaseMovie.userId, -movie.price);
        
        const transactionId = `transaction-${nanoid()}`;
        await this._transactionRepository.addTransaction({
            id: transactionId,
            userId: purchaseMovie.userId,
            movieId: purchaseMovie.movieId,
            type: 'purchase',
            amount: movie.price,
        });

        return transactionId;
    }
}

module.exports = PurchaseMovieUseCase;