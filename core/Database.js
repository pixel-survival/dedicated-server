const config = require('./../config/app');
const mysql = require('mysql2');

class Database {
  constructor() {
    this._db = null;
  }

  connect() {
    this._db = mysql.createPool(config.db.mysql);
    
    return new Promise((resolve, reject) => {
      this._db.query('SELECT 1', error => {        
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async getRowByField(section, field, value, fields) {
    const [response] = await this._db.promise().query(`SELECT * FROM ${section} WHERE ${field} = '${value}'`);

    if (response.length > 0) {
      if (fields && fields.length > 0) {
        return this._getDataByFields(fields, response[0]);
      } else {
        return response[0];
      }
    } else {
      return null;
    }
  }

  async edit(section, field, value, data) {
    let parts = '';
    
    for(const key in data) {
      parts += `SET ${key} = '${data[key]}'`;
    }
    
    const response = await this._db.promise().query(`UPDATE ${section} ${parts} WHERE ${field} = ${value}`);
    
    return response;
  }

  _getDataByFields(fields, data) {
    const payload = {};

    fields.forEach(field => {
      payload[field] = data[field];
    });

    return payload;
  }
}

module.exports = new Database();