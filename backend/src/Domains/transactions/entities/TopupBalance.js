class TopupBalance {
    constructor(payload) {
        this._verifyPayload(payload);

        const { userId, amount } = payload;
        this.userId = userId;
        this.amount = amount;
    }

    _verifyPayload({ userId, amount }) {
        if (!userId || !amount) {
            throw new Error('TOPUP_BALANCE.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof userId !== 'string' || typeof amount !== 'number') {
            throw new Error('TOPUP_BALANCE.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (amount <= 0) {
            throw new Error('TOPUP_BALANCE.AMOUNT_MUST_BE_POSITIVE');
        }
    }
}

module.exports = TopupBalance;