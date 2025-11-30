class TransactionHistory {
    constructor(payload) {
        const { id, type, amount, movieTitle, date } = payload;
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.movieTitle = movieTitle || null;
        this.date = date;
    }
}

module.exports = TransactionHistory;