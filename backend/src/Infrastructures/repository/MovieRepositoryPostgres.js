const { nanoid } = require("nanoid");
const InvariantError = require("../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const MovieRepository = require("../../Domains/movies/MovieRepository");

class MovieRepositoryPostgres extends MovieRepository {
    constructor(pool) {
        super();
        this._pool = pool;
    }

    async getMovieDetails(id) {
        const query = {
            text: 'SELECT * FROM movies WHERE id = $1',
            values: [id],
        }

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Movie not found.');
        }

        return result.rows[0];
    }

    async addMovie(movieDetails) {
        const { title, synopsis, price, year, video, image } = movieDetails;
        const id = `movie-${nanoid(16)}`;
        let imageValue = null;
        if (image) {
            if (typeof image === 'string') {
                imageValue = Buffer.from(image, 'base64');
            } else {
                imageValue = image;
            }
        }
        
        const query = {
            text: 'INSERT INTO movies (id, title, synopsis, price, year, video, image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, synopsis, price, year, video, imageValue],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Failed to add movie.');
        }

        return result.rows[0].id;
    }

    async getAllMovies() {
        const query = {
            text: 'SELECT id, title, year, price, image FROM movies',
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async updateMovie(id, movieDetails) {
        const { title, synopsis, price, year, video, image } = movieDetails;
        let imageValue = null;
        if (image) {
            if (typeof image === 'string') {
                imageValue = Buffer.from(image, 'base64');
            } else {
                imageValue = image;
            }
        }
        
        const query = {
            text: 'UPDATE movies SET title = $1, synopsis = $2, price = $3, year = $4, video = $5, image = $6 WHERE id = $7',
            values: [title, synopsis, price, year, video, imageValue, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Movie not found.');
        }
    }

    async deleteMovie(id) {
        const query = {
            text: 'DELETE FROM movies WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Movie not found.');
        }
    }
}

module.exports = MovieRepositoryPostgres;