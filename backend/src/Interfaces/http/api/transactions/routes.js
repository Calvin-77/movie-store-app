const routes = (handler) => [
    {
        method: 'POST',
        path: '/topup',
        handler: handler.topupBalanceHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'POST',
        path: '/purchase',
        handler: handler.purchaseMovieHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'GET',
        path: '/topup/history',
        handler: handler.getUserTopupHistoryHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
    {
        method: 'GET',
        path: '/sales',
        handler: handler.getAllSalesDataHandler,
        options: {
            auth: 'tugaswebdesign_jwt',
        },
    },
];

module.exports = routes;