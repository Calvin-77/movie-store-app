class GetUserProfileUseCase {
    constructor({ userRepository }) {
        this._userRepository = userRepository;
    }

    async execute(useCasePayload) {
        const { userId } = useCasePayload;
        
        const user = await this._userRepository.getUserById(userId);
        
        console.log('🔍 GetUserProfile - User from DB:', {
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance
        });
        
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance,
        };
    }
}

module.exports = GetUserProfileUseCase;

