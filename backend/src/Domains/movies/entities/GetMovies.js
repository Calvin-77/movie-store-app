class GetMovies {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, title, year, price, image } = payload;
        this.id = id;
        this.title = title;
        this.year = year;
        this.price = price;
        this.image = image ? image.toString('base64') : null;
    }

    _verifyPayload({ id, title, year, price, image }) {
        if (!id || !title || !year || !price) {
            throw new Error('GET_MOVIES.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof title !== 'string' || typeof year !== 'number' || typeof price !== 'number') {
            throw new Error('GET_MOVIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (image && !Buffer.isBuffer(image) && typeof image !== 'string') {
            throw new Error('GET_MOVIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = GetMovies;