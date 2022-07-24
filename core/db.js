const Driver = require('./Driver');
const Query = require('./Query');
const config = require('./../config/app');
const log = require('./Log');
const mysql = require('mysql2');
const EventEmitter = require('events');
const { createClient } = require('redis');

class Databases extends EventEmitter {
  constructor() {
    super();

    this._databases = {
      mysql: mysql.createPool(config.db.mysql),
      redis: createClient(config.db.redis)
    }
    this._driver = {
      mysql: new Driver('mysql', this._databases.mysql),
      redis: new Driver('redis', this._databases.redis)
    }
    this._init();
  }

  async _checkConnections() {
    const connectionStatuses = {
      mysql: {
        status: await this._driver.mysql.checkConnection(),
        host: config.db.mysql.host,
        port: config.db.mysql.port
      },
      redis: {
        status: await this._driver.redis.checkConnection(),
        host: config.db.redis.socket.host,
        port: config.db.redis.socket.port
      }
    }
  
    this._checkConnection(connectionStatuses);
    this._checkDatabaseUnavailability(connectionStatuses);

    if (this._databasesConnected(connectionStatuses)) {
      this.emit('database:connected');
    }
  }

  _checkConnection(connectionStatuses) {
    for(const driverName in connectionStatuses) {
      const host = connectionStatuses[driverName].host;
      const port = connectionStatuses[driverName].port;
  
      if (connectionStatuses[driverName].status === true) {
        log.info(`Connected to "${driverName}" database on ${host}:${port}`);
      } else {
        log.error(`Not connected to "${driverName}" database ${host}:${port}`);
      }
    }
  }

  _checkDatabaseUnavailability(connectionStatuses) {
    Object.values(connectionStatuses).forEach(connectionStatus => {
      if (connectionStatus.status === false) {
        process.exit();
      }
    });
  }
  
  _databasesConnected(connectionStatuses) {
    return Object.values(connectionStatuses).every(connectionStatus => {
      return connectionStatus.status === true;
    });
  }

  get data() {
    return new Query(this._driver.mysql);
  }

  get cache() {
    return new Query(this._driver.redis);
  }

  _init() {
    this._checkConnections();
  }
}

module.exports = new Databases();