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

  async getSectionData(section) {
    const response = await this._call('getSectionData', { section });

    return response;
  }

  async searchByField(section, value) {
    const response = await this._call('searchByField', { section, value });

    return response;
  }

  async add(section, fields) {
    await this._call('add', { section, fields });
  }

  async edit(section, id, fields) {
    await this._call('edit', { section, id, fields });
  }

  async _call(method, params) {
    return await this[`_${this._type}_${method}`](params);
  }

  async _mysql_getRowsByField({ section, field, value }) {
    const [rows] =  await this._db.promise().query(`SELECT * FROM ${section} WHERE ${field} = '${value}'`);

    return rows;
  }

  async _mysql_getSectionData({ section }) {
    const [rows] =  await this._db.promise().query(`SELECT * FROM ${section}`);

    return rows;
  }
  
  async _mysql_getLastRowByField(field, section) {
    const [rows] = await this._db.promise().query(`SELECT ${field} FROM ${section} ORDER BY ${field} DESC LIMIT 1`);

    return rows[0];
  }

  // async _mysql_add({ section, fields }) {
  //   const nameId = this._serialization.getSerializatedInput('id', section);
  //   const lastRow = await this._mysql_getLastRowByField(nameId, section);
  //   const id = ++lastRow[section];
  //   const names = [];
  //   const values = [];

  //   names.push(section);
  //   values.push(id);

  //   for(const field in fields) {
  //     names.push(field);
  //     values.push(`'${fields[field]}'`);
  //   }

  //   await this._db.promise().query(`INSERT INTO ${section}(${names.join(',')}) VALUES(${values.join(',')})`);		
  // }

  // async _mysql_edit({ section, id, fields }) {
  //   const nameId = this._serialization.getSerializatedInput('id', section);
  //   const parts = {
  //     set: ''
  //   };
    
  //   for(const field in fields) {
  //     parts.set += `SET ${field} = '${fields[field]}'`;
  //   }
    
  //   await this._db.promise().query(`UPDATE ${section} ${parts.set} WHERE ${nameId} = ${id}`);
  // }

  async _init() {
    this._db.query('SELECT 1', error => {
      const database = this._db.config.connectionConfig.database;
      const host = this._db.config.connectionConfig.host;
      const port = this._db.config.connectionConfig.port;

      if (error) {
        log.error(`No database connection: "${database}" on ${host}:${port}`);
      } else {
        log.info(`Database connected: "${database}" on ${host}:${port}`);
      }
    })
  }
}

module.exports = Driver;