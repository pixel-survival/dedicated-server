const passwordService = require('./PasswordService');

class User {
  constructor(params) {
    this._id = params.id;
    this._login = params.login;
    this._passwordHash = params.password;
    this._x = params.x;
    this._y = params.y;
  }

  async comparePassword(password) {
    const response = await passwordService.compareHash(password, this._passwordHash);
    
    return response;
  }

  get id() {
    return this._id;
  }

  get login() {
    return this._login;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}

module.exports = User;