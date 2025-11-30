class TransactionRepository {
    async addTransaction(transactionDetails) {
        throw new Error('TRANSACTION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getUserTransactions(userId) {
        throw new Error('TRANSACTION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async checkUserOwnership(userId, movieId) {
        throw new Error('TRANSACTION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getUserTransactionHistory(userId) {
        throw new Error('TRANSACTION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getAllSalesData() {
        throw new Error('TRANSACTION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getUserPurchasedMovies(userId) {
        throw new Error('TRANSACTION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = TransactionRepository;