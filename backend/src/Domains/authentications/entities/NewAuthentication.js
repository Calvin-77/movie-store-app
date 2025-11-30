class NewAuthentication {
    constructor(payload) {
        this._verifyPayload(payload);

        const { refreshToken, accessToken } = payload;

        this.refreshToken  = refreshToken;
        this.accessToken =  accessToken;
    }

    _verifyPayload({ refreshToken, accessToken }) {
        if (!refreshToken || !accessToken) {
            throw new Error('NEW_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof refreshToken !== 'string' || typeof accessToken !== 'string') {
            throw new Error('NEW_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = NewAuthentication;