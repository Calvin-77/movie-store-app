const routes = require('./routes');
const MoviesHandler = require('./handler');

module.exports = {
    name: 'movies',
    register: async (server, { container }) => {
        const moviesHandler = new MoviesHandler(container);
        server.route(routes(moviesHandler));
    },
};
