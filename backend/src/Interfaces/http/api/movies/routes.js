const routes = (handler) => [
    {
        method: 'GET',
        path: '/movies',
        handler: handler.getAllMoviesHandler,
    },
    {
        method: 'GET',
        path: '/movies/{movieId}',
        handler: handler.getMovieDetailsHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'POST',
        path: '/movies',
        handler: handler.addMovieHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/movies/{movieId}',
        handler: handler.updateMovieHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/movies/{movieId}',
        handler: handler.deleteMovieHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
];

module.exports = routes;