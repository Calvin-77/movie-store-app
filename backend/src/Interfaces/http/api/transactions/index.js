const TransactionsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'transactions',
    register: async (server, { container }) => {
        const transactionsHandler = new TransactionsHandler(container);
        server.route(routes(transactionsHandler));
    },
};