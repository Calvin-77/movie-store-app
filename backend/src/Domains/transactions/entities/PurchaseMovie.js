class PurchaseMovie {
    constructor(payload) {
        this._verifyPayload(payload);

        const { userId, movieId } = payload;
        this.userId = userId;
        this.movieId = movieId;
    }

    _verifyPayload({ userId, movieId }) {
        if (!userId || !movieId) {
            throw new Error('PURCHASE_MOVIE.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof userId !== 'string' || typeof movieId !== 'string') {
            throw new Error('PURCHASE_MOVIE.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = PurchaseMovie;