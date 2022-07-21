const log = require('./Log');

class Driver {
  constructor(type, db) {
    this._type = type;
    this._db = db;
    this._init();
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

  async _init() {
    this._db.query('SELECT 1', error => {
      const host = this._db.config.connectionConfig.host;
      const port = this._db.config.connectionConfig.port;

      if (error) {
        log.error(`No database connection on ${host}:${port}`);
      } else {
        log.info(`Database connected on ${host}:${port}`);
      }
    })
  }
}

module.exports = Driver;