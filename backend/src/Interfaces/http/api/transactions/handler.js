const TopupBalanceUseCase = require('../../../../Applications/use_case/TopupBalanceUseCase');
const PurchaseMovieUseCase = require('../../../../Applications/use_case/PurchaseMovieUseCase');
const GetUserTopupHistoryUseCase = require('../../../../Applications/use_case/GetUserTopupHistoryUseCase');
const GetAllSalesDataUseCase = require('../../../../Applications/use_case/GetAllSalesDataUseCase');

class TransactionsHandler {
    constructor(container) {
        this._container = container;

        this.topupBalanceHandler = this.topupBalanceHandler.bind(this);
        this.purchaseMovieHandler = this.purchaseMovieHandler.bind(this);
        this.getUserTopupHistoryHandler = this.getUserTopupHistoryHandler.bind(this);
        this.getAllSalesDataHandler = this.getAllSalesDataHandler.bind(this);
    }

    async topupBalanceHandler(request, h) {
        const { amount } = request.payload;
        const { id: userId } = request.auth.credentials;

        const topupBalanceUseCase = this._container.getInstance(TopupBalanceUseCase.name);
        const transactionId = await topupBalanceUseCase.execute({ userId, amount });

        return h.response({
            status: 'success',
            data: {
                transactionId,
            },
        }).code(201);
    }

    async purchaseMovieHandler(request, h) {
        const { movieId } = request.payload;
        const { id: userId } = request.auth.credentials;

        const purchaseMovieUseCase = this._container.getInstance(PurchaseMovieUseCase.name);
        const transactionId = await purchaseMovieUseCase.execute({ userId, movieId });

        return h.response({
            status: 'success',
            data: {
                transactionId,
            },
        }).code(201);
    }

    async getUserTopupHistoryHandler(request, h) {
        const { id: userId } = request.auth.credentials;

        const getUserTopupHistoryUseCase = this._container.getInstance(GetUserTopupHistoryUseCase.name);
        const transactions = await getUserTopupHistoryUseCase.execute({ userId });

        return h.response({
            status: 'success',
            data: {
                transactions,
            },
        });
    }

    async getAllSalesDataHandler(request, h) {
        const { id: userId } = request.auth.credentials;

        const getAllSalesDataUseCase = this._container.getInstance(GetAllSalesDataUseCase.name);
        const salesData = await getAllSalesDataUseCase.execute({ userId });

        return h.response({
            status: 'success',
            data: {
                salesData,
            },
        });
    }
}

module.exports = TransactionsHandler;