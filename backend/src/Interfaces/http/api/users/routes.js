const routes = (handler) => ([
    {
        method: 'POST',
        path: '/users',
        handler: handler.postUserHandler,
    },
    {
        method: 'GET',
        path: '/users/profile',
        handler: handler.getUserProfileHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/users/profile',
        handler: handler.updateUserProfileHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'GET',
        path: '/users/purchased-movies',
        handler: handler.getUserPurchasedMoviesHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
]);

module.exports = routes;