const { createClient } = require('redis');

class Cache {
  constructor() {
    this._db = null;
  }

  async set(key, value) {
    const response = await this._db.set(key, value);

    if (response === 'OK') {
      return true;
    } else {
      return false;
    }
  }

  async get(key) {
    const response = await this._db.get(key);

    return response;
  }

  async connect(params) {
    this._db = createClient(params);

    return new Promise(async (resolve, reject) => {
      this._db.on('error', () => {
        resolve(false);
      });
      this._db.on('ready', () => {
        resolve(true);
      });
  
      await this._db.connect();
    });
  }
}

module.exports = new Cache();