const cache = require('./../core/Cache');
const database = require('./../core/Database');
const config = require('./../config/app');
const jwtService = require('./../core/JwtService');
const log = require('./../core/Log');

class Databases {
  async connect() {
    const connectedCache = await this._checkConnectionCache();
    const connectedDatabase = await this._checkConnectionDatabase();

    if (connectedCache) {
      await this._loadDataCache();
    }

    if (!connectedCache || !connectedDatabase) {
      process.exit();
    }
  }

  async _checkConnectionCache() {
    return new Promise(async (resolve, reject) => {
      const connected = await cache.connect(config.db.redis);
      const host = config.db.redis.socket.host;
      const port = config.db.redis.socket.port;

      if (connected) {
        log.info(`Connected to cache on ${host}:${port}`);
      } else {
        log.error(`Not connected to cache on ${host}:${port}`);
      }

      resolve(connected);
    });
  }

  async _checkConnectionDatabase() {
    return new Promise(async (resolve, reject) => {
      const connected = await database.connect();
      const host = config.db.mysql.host;
      const port = config.db.mysql.port;
      
      if (connected) {
        log.info(`Connected to database on ${host}:${port}`);
      } else {
        log.error(`Not connected to database on ${host}:${port}`);
      }

      resolve(connected);
    })
  }

  async _loadDataCache() {
    jwtService.secretKey = await cache.get('jwt:secretkey');
  }
}

module.exports = new Databases();