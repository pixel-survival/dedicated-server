class Query {
  constructor(driver) {
    this._driver = driver;
  }
  
  async getRowByField(section, field, value, fields) {
    const response = await this._driver.getRowsByField(section, field, value);

    if (response.length > 0) {
      if (fields && fields.length > 0) {
        const payload = {};

        fields.forEach(field => {
          payload[field] = response[0][field];
        });

        return payload;
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
}

module.exports = Query;