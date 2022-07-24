class Driver {
  constructor(type, db) {
    this._type = type;
    this._db = db;
  }

  get type() {
    return this._type;
  }

  async getRowsByField(section, field, value) {
    const response = await this._call('getRowsByField', { section, field, value });

    return response;
  }

  async updateRow(section, id, data) {
    const response = await this._call('edit', { section, field: 'id', value: id, data });

    return response;
  }

  async add(section, field, value) {
    const response = await this._call('add', { section, field, value });

    return response;
  }

  async get(section, field) {
    const response = await this._call('get', { section, field });

    return response;
  }

  async _call(method, params) {
    const response = await this[`_${this._type}_${method}`](params);

    return response; 
  }

  async _mysql_getRowsByField({ section, field, value }) {
    const [rows] =  await this._db.promise().query(`SELECT * FROM ${section} WHERE ${field} = '${value}'`);

    return rows;
  }

  async _mysql_edit({ section, field, value, data }) {
    const parts = {
      set: ''
    };
    
    for(const key in data) {
      parts.set += `SET ${key} = '${data[key]}'`;
    }
    
    const response = await this._db.promise().query(`UPDATE ${section} ${parts.set} WHERE ${field} = ${value}`);
    
    return response;
  }

  async _redis_add({ section, field, value }) {
    const response = await this._db.set(`${section}:${field}`, value);

    if (response === 'OK') {
      return true;
    } else {
      return false;
    }
  }

  async _redis_get({ section, field }) {
    const response = await this._db.get(`${section}:${field}`);

    return response;
  }

  _checkMysqlConnection() {
    return new Promise((resolve, reject) => {
      this._db.query('SELECT 1', error => {        
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    })
  }

  async _checkRedisConnection() {
    return new Promise(async (resolve, reject) => {
      this._db.on('error', () => {
        resolve(false);
      });
      this._db.on('ready', () => {
        resolve(true);
      });
  
      await this._db.connect();
    })
  }

  async checkConnection() {
    switch(this._type) {
      case 'mysql':
        return await this._checkMysqlConnection();
      case 'redis':
        return await this._checkRedisConnection();
    }
  }
}

module.exports = Driver;