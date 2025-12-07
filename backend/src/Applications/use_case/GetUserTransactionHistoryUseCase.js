class GetUserTransactionHistoryUseCase {
    constructor({ transactionRepository }) {
        this._transactionRepository = transactionRepository;
    }

    async execute(useCasePayload) {
        const { userId } = useCasePayload;
        
        const transactions = await this._transactionRepository.getUserTransactionHistory(userId);
        return transactions;
    }
}

module.exports = GetUserTransactionHistoryUseCase;


