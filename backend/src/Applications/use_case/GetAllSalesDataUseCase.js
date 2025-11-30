class GetAllSalesDataUseCase {
    constructor({ transactionRepository, userRepository }) {
        this._transactionRepository = transactionRepository;
        this._userRepository = userRepository;
    }

    async execute(useCasePayload) {
        const { userId } = useCasePayload;
        
        const isAdmin = await this._userRepository.isAdmin(userId);
        if (!isAdmin) {
            throw new Error('FORBIDDEN_ACCESS');
        }
        
        const salesData = await this._transactionRepository.getAllSalesData();
        
        return salesData;
    }
}

module.exports = GetAllSalesDataUseCase;