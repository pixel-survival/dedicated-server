const passwordService = require('./PasswordService');
const db = require('./db');

class User {
  constructor(params) {
    this._id = params.id;
    this._login = params.login;
    this._passwordHash = params.password;
    this._token = params.token;
  }

  async update(fields) {
    const response = await db.query.updateRow('users', this._id, fields);
        
    if (response) {
      for(const key in response) {
        switch(key) {
          case 'password':
            this[`_${key}Hash`] = response[key];

            break;
          default:
            this[`_${key}`] = response[key];
                        
            break;
        }
      }
    }

    return response;
  }

  async comparePassword(password) {
    const response = await passwordService.compareHash(password, this._passwordHash);
    
    return response;
  }

  get id() {
    return this._id;
  }
}

module.exports = User;