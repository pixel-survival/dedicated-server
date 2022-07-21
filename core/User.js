const db = require('./db');

class User {
    constructor(params) {
        this._id = params.id;
        this._login = params.login;
        this._password = params.password;
        this._token = params.token;
    }

    async update(fields) {
        const response = await db.query.updateRow('users', this._id, fields);
        
        if (response) {
            for(const key in response) {
                this[`_${key}`] = response[key];
            }
        }

        return response;
    }

    comparePassword(password) {
        return this._password === password;
    }

    get id() {
        return this._id;
    }
}

module.exports = User;