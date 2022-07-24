class Query {
  constructor(driver) {
    this._driver = driver;
  }
  
  async getRowByField(section, field, value, fields) {
    const response = await this._driver.getRowsByField(section, field, value);

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

  async updateRow(section, id, data) {
    const [rowUpdated] = await this._driver.updateRow(section, id, data);

    if (rowUpdated.changedRows > 0) {
      const response = await this._driver.getRowsByField(section, 'id', id);

      if (response.length > 0) {
        return response[0];
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async add(section, field, value) {
    const response = await this._driver.add(section, field, value);

    return response;
  }

  async get(section, field) {
    const response = await this._driver.get(section, field);

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

module.exports = Query;