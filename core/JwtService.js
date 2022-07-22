const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JwtService {
  constructor() {
    this._secretKey = null;
    this._init();
  }

  createToken(params) {
    const token = jwt.sign(params, this._secretKey);

    return token;
  }

  _createSecretKey() {
    this._secretKey = crypto.randomBytes(256).toString('base64');
  }

  _init() {
    this._createSecretKey();
  }
}

module.exports = new JwtService();