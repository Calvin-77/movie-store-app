class UpdateUserProfileUseCase {
    constructor({ userRepository, passwordHash }) {
        this._userRepository = userRepository;
        this._passwordHash = passwordHash;
    }

    async execute(useCasePayload) {
        const { userId, username, password, email } = useCasePayload;
        
        const currentUser = await this._userRepository.getUserById(userId);
        
        if (username && username !== currentUser.username) {
            await this._userRepository.verifyAvailableUsername(username);
        }

        const hashedPassword = password ? await this._passwordHash.hash(password) : currentUser.password;
        
        await this._userRepository.updateUser(userId, {
            username: username || currentUser.username,
            password: hashedPassword,
            email: email || currentUser.email
        });
    }
}

module.exports = UpdateUserProfileUseCase;