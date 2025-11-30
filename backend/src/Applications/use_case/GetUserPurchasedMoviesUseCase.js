class GetUserPurchasedMoviesUseCase {
    constructor({ transactionRepository }) {
        this._transactionRepository = transactionRepository;
    }

    async execute(useCasePayload) {
        const { userId } = useCasePayload;
        
        return await this._transactionRepository.getUserPurchasedMovies(userId);
    }
}

module.exports = GetUserPurchasedMoviesUseCase;