class RegisterUser {
    constructor(payload) {
        this._verifyPayload(payload);

        const { username, email, password } = payload;

        this.username = username;
        this.email = email;
        this.password = password;
    }

    _verifyPayload({ username, email, password }) {
        if (!username || !email || !password) {
            throw new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            throw new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (!username.match(/^[\w]+$/)) {
            throw new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
        }
    }
}

module.exports = RegisterUser;