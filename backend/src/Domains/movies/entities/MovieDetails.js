class MovieDetails {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, title, synopsis, price, year, video, image, owned } = payload;
        this.id = id;
        this.title = title;
        this.synopsis = synopsis;
        this.price = price;
        this.year = year;
        this.video = video;
        this.image = image ? image.toString('base64') : null;
        this.owned = owned || false;
    }

    _verifyPayload({ id, title, synopsis, price, year, video, image }) {
        if (!id || !title || !price || !video) {
            throw new Error('MOVIE_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof title !== 'string' || typeof synopsis !== 'string' || typeof price !== 'number' || typeof year !== 'number' || typeof video !== 'string') {
            throw new Error('MOVIE_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (image && !Buffer.isBuffer(image) && typeof image !== 'string') {
            throw new Error('MOVIE_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = MovieDetails;