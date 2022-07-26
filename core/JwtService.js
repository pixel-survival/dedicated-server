const jwt = require('jsonwebtoken');

class JwtService {
  constructor() {
    this._secretKey = null;;
  }

  createToken(params) {
    const token = jwt.sign(params, this._secretKey);

    return token;
  }

  verify(token) {
    try {
      return jwt.verify(token, this._secretKey);
    } catch(error) {
      return `${error.name}: ${error.message}`;
    }
  }

  set secretKey(value) {
    this._secretKey = value;
  }
}

module.exports = new JwtService();