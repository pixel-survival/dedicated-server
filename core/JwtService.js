const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');

class JwtService {
  constructor() {
    this._secretKey = null;

    db.on('database:connected', this._onDatabaseConnected.bind(this));
  }

  createToken(params) {
    const token = jwt.sign(params, this._secretKey);

    return token;
  }

  verify(token) {
    try {
      console.log(this._secretKey);
      return jwt.verify(token, this._secretKey);
    } catch(error) {
      return `${error.name}: ${error.message}`;
    }

    
  }

  async _createSecretKey() {
    const secretKey = crypto.randomBytes(256).toString('base64');
    const response = await db.cache.add('jwt', 'secretkey', secretKey);

    return response;
  }

  async _onDatabaseConnected() {
    const secretKey = await db.cache.get('jwt', 'secretkey');

    if (secretKey === null) {
      const response = await this._createSecretKey();

      if (response) {
        this._secretKey =  await db.cache.get('jwt', 'secretkey');
      }
    } else {
      this._secretKey = secretKey;
    }
  }
}

module.exports = new JwtService();