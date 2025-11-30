const { nanoid } = require('nanoid');
const TopupBalance = require('../../Domains/transactions/entities/TopupBalance');

class TopupBalanceUseCase {
    constructor({ userRepository, transactionRepository }) {
        this._userRepository = userRepository;
        this._transactionRepository = transactionRepository;
    }

    async execute(useCasePayload) {
        const topupBalance = new TopupBalance(useCasePayload);
        
        await this._userRepository.updateBalance(topupBalance.userId, topupBalance.amount);
        
        const transactionId = `transaction-${nanoid()}`;
        await this._transactionRepository.addTransaction({
            id: transactionId,
            userId: topupBalance.userId,
            type: 'topup',
            amount: topupBalance.amount,
        });

        return transactionId;
    }
}

module.exports = TopupBalanceUseCase;