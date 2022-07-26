const passwordService = require('./PasswordService');

class User {
  constructor(params) {
    this._id = params.id;
    this._login = params.login;
    this._passwordHash = params.password;
    this._token = params.token;
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