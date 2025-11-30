const AddUserUseCase = require('../../../../Applications/use_case/AddUserUseCase');
const UpdateUserProfileUseCase = require('../../../../Applications/use_case/UpdateUserProfileUseCase');
const GetUserPurchasedMoviesUseCase = require('../../../../Applications/use_case/GetUserPurchasedMoviesUseCase');
const GetUserProfileUseCase = require('../../../../Applications/use_case/GetUserProfileUseCase');

class UsersHandler {
    constructor(container) {
        this._container = container;

        this.postUserHandler = this.postUserHandler.bind(this);
        this.updateUserProfileHandler = this.updateUserProfileHandler.bind(this);
        this.getUserPurchasedMoviesHandler = this.getUserPurchasedMoviesHandler.bind(this);
        this.getUserProfileHandler = this.getUserProfileHandler.bind(this);
    }

    async postUserHandler(request, h) {
        const addUserUseCase = this._container.getInstance(AddUserUseCase.name);
        const addedUser = await addUserUseCase.execute(request.payload);

        const response = h.response({
            status: 'success',
            data: {
                addedUser,
            },
        });
        response.code(201);
        return response;
    }

    async updateUserProfileHandler(request, h) {
        const { username, password, email } = request.payload;
        const { id: userId } = request.auth.credentials;

        const updateUserProfileUseCase = this._container.getInstance(UpdateUserProfileUseCase.name);
        await updateUserProfileUseCase.execute({ userId, username, password, email });

        return h.response({
            status: 'success',
            message: 'Profile berhasil diupdate',
        });
    }

    async getUserPurchasedMoviesHandler(request, h) {
        const { id: userId } = request.auth.credentials;

        const getUserPurchasedMoviesUseCase = this._container.getInstance(GetUserPurchasedMoviesUseCase.name);
        const movies = await getUserPurchasedMoviesUseCase.execute({ userId });

        return h.response({
            status: 'success',
            data: {
                movies,
            },
        });
    }

    async getUserProfileHandler(request, h) {
        const { id: userId } = request.auth.credentials;

        const getUserProfileUseCase = this._container.getInstance(GetUserProfileUseCase.name);
        const user = await getUserProfileUseCase.execute({ userId });

        return h.response({
            status: 'success',
            data: user,
        });
    }
}

module.exports = UsersHandler;