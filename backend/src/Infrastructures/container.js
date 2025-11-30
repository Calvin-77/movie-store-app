const { createContainer } = require('instances-container');

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('./database/postgres/pool');

// service (repository, helper, manager, etc)
const UserRepository = require('../Domains/users/UserRepository');
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const PasswordHash = require('../Applications/security/PasswordHash');
const BcryptPasswordHash = require('./security/BcryptPasswordHash');

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const AuthenticationTokenManager = require('../Applications/security/AuthenticationTokenManager');
const JwtTokenManager = require('./security/JwtTokenManager');
const RefreshAuthenticationUseCase = require('../Applications/use_case/RefreshAuthenticationUseCase');
const AuthenticationRepository = require('../Domains/authentications/AuthenticationRepository');
const LoginUserUseCase = require('../Applications/use_case/LoginUserUseCase');
const LogoutUserUseCase = require('../Applications/use_case/LogoutUserUseCase');
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres');
const MovieRepository = require('../Domains/movies/MovieRepository');
const MovieRepositoryPostgres = require('./repository/MovieRepositoryPostgres');
const TransactionRepository = require('../Domains/transactions/TransactionRepository');
const TransactionRepositoryPostgres = require('./repository/TransactionRepositoryPostgres');
const GetMovieDetailsUseCase = require('../Applications/use_case/GetMovieDetailsUseCase');
const GetAllMoviesUseCase = require('../Applications/use_case/GetAllMoviesUseCase');
const AddMovieUseCase = require('../Applications/use_case/AddMovieUseCase');
const TopupBalanceUseCase = require('../Applications/use_case/TopupBalanceUseCase');
const PurchaseMovieUseCase = require('../Applications/use_case/PurchaseMovieUseCase');
const GetUserTopupHistoryUseCase = require('../Applications/use_case/GetUserTopupHistoryUseCase');
const GetAllSalesDataUseCase = require('../Applications/use_case/GetAllSalesDataUseCase');
const UpdateMovieUseCase = require('../Applications/use_case/UpdateMovieUseCase');
const DeleteMovieUseCase = require('../Applications/use_case/DeleteMovieUseCase');
const UpdateUserProfileUseCase = require('../Applications/use_case/UpdateUserProfileUseCase');
const GetUserPurchasedMoviesUseCase = require('../Applications/use_case/GetUserPurchasedMoviesUseCase');
const GetUserProfileUseCase = require('../Applications/use_case/GetUserProfileUseCase');

// creating container
const container = createContainer();

// registering services and repository
container.register([
    {
        key: UserRepository.name,
        Class: UserRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
                {
                    concrete: nanoid,
                },
            ],
        },
    },
    {
        key: PasswordHash.name,
        Class: BcryptPasswordHash,
        parameter: {
            dependencies: [
                {
                    concrete: bcrypt,
                },
            ],
        },
    },
    {
        key: AuthenticationTokenManager.name,
        Class: JwtTokenManager,
        parameter: {
            dependencies: [
                {
                    concrete: Jwt.token,
                },
            ],
        },
    },
    {
        key: AuthenticationRepository.name,
        Class: AuthenticationRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
            ],
        },
    },
    {
        key: MovieRepository.name,
        Class: MovieRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
            ],
        },
    },
    {
        key: TransactionRepository.name,
        Class: TransactionRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
            ],
        },
    },
]);

// registering use cases
container.register([
    {
        key: AddUserUseCase.name,
        Class: AddUserUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
                {
                    name: 'passwordHash',
                    internal: PasswordHash.name,
                },
            ],
        },
    },
    {
        key: RefreshAuthenticationUseCase.name,
        Class: RefreshAuthenticationUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'authenticationRepository',
                    internal: AuthenticationRepository.name,
                },
                {
                    name: 'authenticationTokenManager',
                    internal: AuthenticationTokenManager.name,
                },
            ],
        },
    },
    {
        key: LoginUserUseCase.name,
        Class: LoginUserUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
                {
                    name: 'authenticationRepository',
                    internal: AuthenticationRepository.name,
                },
                {
                    name: 'authenticationTokenManager',
                    internal: AuthenticationTokenManager.name,
                },
                {
                    name: 'passwordHash',
                    internal: PasswordHash.name,
                },
            ],
        },
    },
    {
        key: LogoutUserUseCase.name,
        Class: LogoutUserUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'authenticationRepository',
                    internal: AuthenticationRepository.name,
                },
            ],
        },
    },
    {
        key: GetMovieDetailsUseCase.name,
        Class: GetMovieDetailsUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'movieRepository',
                    internal: MovieRepository.name,
                },
                {
                    name: 'transactionRepository',
                    internal: TransactionRepository.name,
                },
            ],
        },
    },
    {
        key: GetAllMoviesUseCase.name,
        Class: GetAllMoviesUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'movieRepository',
                    internal: MovieRepository.name,
                },
            ],
        },
    },
    {
        key: AddMovieUseCase.name,
        Class: AddMovieUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'movieRepository',
                    internal: MovieRepository.name,
                },
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
            ],
        },
    },
    {
        key: TopupBalanceUseCase.name,
        Class: TopupBalanceUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
                {
                    name: 'transactionRepository',
                    internal: TransactionRepository.name,
                },
            ],
        },
    },
    {
        key: PurchaseMovieUseCase.name,
        Class: PurchaseMovieUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
                {
                    name: 'movieRepository',
                    internal: MovieRepository.name,
                },
                {
                    name: 'transactionRepository',
                    internal: TransactionRepository.name,
                },
            ],
        },
    },
    {
        key: GetUserTopupHistoryUseCase.name,
        Class: GetUserTopupHistoryUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'transactionRepository',
                    internal: TransactionRepository.name,
                },
            ],
        },
    },
    {
        key: GetAllSalesDataUseCase.name,
        Class: GetAllSalesDataUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'transactionRepository',
                    internal: TransactionRepository.name,
                },
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
            ],
        },
    },
    {
        key: UpdateMovieUseCase.name,
        Class: UpdateMovieUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'movieRepository',
                    internal: MovieRepository.name,
                },
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
            ],
        },
    },
    {
        key: DeleteMovieUseCase.name,
        Class: DeleteMovieUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'movieRepository',
                    internal: MovieRepository.name,
                },
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
            ],
        },
    },
    {
        key: UpdateUserProfileUseCase.name,
        Class: UpdateUserProfileUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
                {
                    name: 'passwordHash',
                    internal: PasswordHash.name,
                },
            ],
        },
    },
    {
        key: GetUserPurchasedMoviesUseCase.name,
        Class: GetUserPurchasedMoviesUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'transactionRepository',
                    internal: TransactionRepository.name,
                },
            ],
        },
    },
    {
        key: GetUserProfileUseCase.name,
        Class: GetUserProfileUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
            ],
        },
    },
]);

module.exports = container;