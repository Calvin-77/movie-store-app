const config = {
    app: {
        host: process.env.HOST || 'localhost',
        port: parseInt(process.env.PORT) || 5000
    }
};

module.exports = config;