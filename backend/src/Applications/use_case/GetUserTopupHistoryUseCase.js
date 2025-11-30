class GetUserTopupHistoryUseCase {
    constructor({ transactionRepository }) {
        this._transactionRepository = transactionRepository;
    }

    async execute(useCasePayload) {
        const { userId } = useCasePayload;
        
        const transactions = await this._transactionRepository.getUserTransactions(userId);
        return transactions;
    }
}

module.exports = GetUserTopupHistoryUseCase;