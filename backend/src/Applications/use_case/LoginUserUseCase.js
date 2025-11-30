const LoginUser = require('../../Domains/users/entities/LoginUser');
const NewAuthentication = require('../../Domains/authentications/entities/NewAuthentication');

class LoginUserUseCase {
    constructor({
        userRepository,
        authenticationRepository,
        authenticationTokenManager,
        passwordHash,
    }) {
        this._userRepository = userRepository;
        this._authenticationRepository = authenticationRepository;
        this._authenticationTokenManager = authenticationTokenManager;
        this._passwordHash = passwordHash;
    }

    async execute(useCasePayload) {
        const { username, password } = new LoginUser(useCasePayload);

        const encryptedPassword = await this._userRepository.getPasswordByUsername(username);

        await this._passwordHash.comparePassword(password, encryptedPassword);

        const id = await this._userRepository.getIdByUsername(username);

        const isAdmin = await this._userRepository.isAdmin(id);

        const accessToken = await this._authenticationTokenManager
            .createAccessToken({ username, id });
        const refreshToken = await this._authenticationTokenManager
            .createRefreshToken({ username, id });

        const newAuthentication = new NewAuthentication({
            accessToken,
            refreshToken,
        });

        const result = {
            ...newAuthentication,
            role: isAdmin === true ? 'admin' : 'user',
        }

        await this._authenticationRepository.addToken(newAuthentication.refreshToken);

        return result;
    }
}

module.exports = LoginUserUseCase;