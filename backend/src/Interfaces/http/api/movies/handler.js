const AddMovieUseCase = require("../../../../Applications/use_case/AddMovieUseCase");
const GetAllMoviesUseCase = require("../../../../Applications/use_case/GetAllMoviesUseCase");
const GetMovieDetailsUseCase = require("../../../../Applications/use_case/GetMovieDetailsUseCase");
const UpdateMovieUseCase = require("../../../../Applications/use_case/UpdateMovieUseCase");
const DeleteMovieUseCase = require("../../../../Applications/use_case/DeleteMovieUseCase");

class MoviesHandler {
    constructor(container) {
        this._container = container;

        this.addMovieHandler = this.addMovieHandler.bind(this);
        this.getAllMoviesHandler = this.getAllMoviesHandler.bind(this);
        this.getMovieDetailsHandler = this.getMovieDetailsHandler.bind(this);
        this.updateMovieHandler = this.updateMovieHandler.bind(this);
        this.deleteMovieHandler = this.deleteMovieHandler.bind(this);
    }

    async addMovieHandler(request, h) {
        const { title, synopsis, price, year, video, image } = request.payload;
        const { id: userId } = request.auth.credentials;

        const addMovieUseCase = this._container.getInstance(AddMovieUseCase.name);
        const movieId = await addMovieUseCase.execute({ userId, title, synopsis, price, year, video, image });

        return h.response({
            status: 'success',
            data: {
                movieId,
            },
        }).code(201);
    }

    async getAllMoviesHandler(request, h) {
        const getAllMoviesUseCase = this._container.getInstance(GetAllMoviesUseCase.name);
        const movies = await getAllMoviesUseCase.execute();

        return h.response({
            status: 'success',
            data: {
                movies,
            },
        });
    }

    async getMovieDetailsHandler(request, h) {
        const { movieId } = request.params;
        const userId = request.auth.credentials?.id;

        const getMovieDetailsUseCase = this._container.getInstance(GetMovieDetailsUseCase.name);
        const movieDetails = await getMovieDetailsUseCase.execute({ movieId, userId });

        return h.response({
            status: 'success',
            data: {
                movie: movieDetails,
            },
        });
    }

    async updateMovieHandler(request, h) {
        const { movieId } = request.params;
        const { title, synopsis, price, year, video, image } = request.payload;
        const { id: userId } = request.auth.credentials;

        const updateMovieUseCase = this._container.getInstance(UpdateMovieUseCase.name);
        await updateMovieUseCase.execute({ userId, movieId, title, synopsis, price, year, video, image });

        return h.response({
            status: 'success',
            message: 'Movie berhasil diupdate',
        });
    }

    async deleteMovieHandler(request, h) {
        const { movieId } = request.params;
        const { id: userId } = request.auth.credentials;

        const deleteMovieUseCase = this._container.getInstance(DeleteMovieUseCase.name);
        await deleteMovieUseCase.execute({ userId, movieId });

        return h.response({
            status: 'success',
            message: 'Movie berhasil dihapus',
        });
    }
}

module.exports = MoviesHandler;