const TransactionRepository = require('../../Domains/transactions/TransactionRepository');

class TransactionRepositoryPostgres extends TransactionRepository {
    constructor(pool) {
        super();
        this._pool = pool;
    }

    async addTransaction(transactionDetails) {
        const { id, userId, movieId, type, amount } = transactionDetails;

        const query = {
            text: 'INSERT INTO transactions (id, user_id, movie_id, type, amount) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            values: [id, userId, movieId, type, amount],
        };

        const result = await this._pool.query(query);
        return result.rows[0].id;
    }

    async getUserTransactions(userId) {
        const query = {
            text: 'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
            values: [userId],
        };

        const result = await this._pool.query(query);
        return result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            movieId: row.movie_id,
            type: row.type,
            amount: row.amount,
            date: row.date,
        }));
    }

    async getUserTransactionHistory(userId) {
        const query = {
            text: `SELECT t.id, t.type, t.amount, m.title as movie_title, t.date 
                   FROM transactions t 
                   LEFT JOIN movies m ON t.movie_id = m.id 
                   WHERE t.user_id = $1 
                   ORDER BY t.date DESC`,
            values: [userId],
        };

        const result = await this._pool.query(query);
        return result.rows.map(row => ({
            id: row.id,
            type: row.type,
            amount: row.amount,
            movieTitle: row.movie_title,
            date: row.date,
        }));
    }

    async getAllSalesData() {
        const query = {
            text: `SELECT t.id, u.username, m.title as movie_title, t.amount, t.date 
                   FROM transactions t 
                   JOIN users u ON t.user_id = u.id 
                   LEFT JOIN movies m ON t.movie_id = m.id 
                   WHERE t.type = 'purchase'
                   ORDER BY t.date DESC`,
        };

        const result = await this._pool.query(query);
        return result.rows.map(row => ({
            id: row.id,
            username: row.username,
            movieTitle: row.movie_title,
            amount: row.amount,
            date: row.date,
        }));
    }

    async checkUserOwnership(userId, movieId) {
        const query = {
            text: 'SELECT id FROM transactions WHERE user_id = $1 AND movie_id = $2 AND type = $3',
            values: [userId, movieId, 'purchase'],
        };

        const result = await this._pool.query(query);
        return result.rowCount > 0;
    }

    async getUserPurchasedMovies(userId) {
        const query = {
            text: `SELECT DISTINCT m.id, m.title, m.year, m.price, m.image, t.date as purchase_date
                   FROM transactions t 
                   JOIN movies m ON t.movie_id = m.id 
                   WHERE t.user_id = $1 AND t.type = 'purchase'
                   ORDER BY t.date DESC`,
            values: [userId],
        };

        const result = await this._pool.query(query);
        return result.rows.map(row => ({
            id: row.id,
            title: row.title,
            year: row.year,
            price: row.price,
            image: row.image,
            purchaseDate: row.purchase_date,
        }));
    }
}

module.exports = TransactionRepositoryPostgres;