const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const movies = require('../../Interfaces/http/api/movies');
const transactions = require('../../Interfaces/http/api/transactions');
const config = require('../../Commons/config');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const ClientError = require('../../Commons/exceptions/ClientError');

const createServer = async (container) => {
    const server = Hapi.server({
        host: config.app.host,
        port: config.app.port,
        routes: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-with'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    server.auth.strategy('tugaswebdesign_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: parseInt(process.env.ACCESS_TOKEN_AGE) || 3600,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: users,
            options: { container },
        },
        {
            plugin: authentications,
            options: { container },
        },
        {
            plugin: movies,
            options: { container },
        },
        {
            plugin: transactions,
            options: { container },
        }
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            // Log the actual error for debugging
            console.error('Server Error:', response.message);
            console.error('Stack:', response.stack);
            
            const translatedError = DomainErrorTranslator.translate(response);

            if (translatedError instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: translatedError.message,
                });
                newResponse.code(translatedError.statusCode);
                return newResponse;
            }

            if (!translatedError.isServer) {
                return h.continue;
            }

            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server kami',
            });
            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    });

    return server;
};

module.exports = createServer;