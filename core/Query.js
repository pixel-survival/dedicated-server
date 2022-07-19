class Query {
  constructor(driver) {
    this._driver = driver;
  }
  
  // async getByField(section, field, value, fields) {
  //   const response = await this._driver.getByField(section, this._serialization.getSerializatedInput(field, section), value);

  //   if (response.length > 0) {
  //     return this._serialization.getPayload(response, fields);
  //   } else {
  //     return null;
  //   }
  // }

  // async searchByField(section, value, fields) {
  //   const response = await this._driver.searchByField(section, value);

  //   if (response.length > 0) {
  //     return this._serialization.getPayload(response, fields);
  //   } else {
  //     return null;
  //   }
  // }

  // async add(section, data) {
  //   const serializatedData = {};

  //   for(const key in data) {
  //     const value = data[key] === undefined ? null : data[key];

  //     serializatedData[this._serialization.getSerializatedInput(key, section)] = value;
  //   }		

  //   await this._driver.add(section, serializatedData);
  // }

  // async edit(section, id, fields) {
  //   const serializatedFields = {}
    
  //   for(const field in fields) {
  //     serializatedFields[this._serialization.getSerializatedInput(field, section)] = fields[field];
  //   }

  //   await this._driver.edit(section, id, serializatedFields);
  // }

  // async getSectionData(section) {
  //   const response = await this._driver.getSectionData(section);

  //   if (response.length > 0) {
  //     return this._serialization.getPayload(response);
  //   } else {
  //     return null;
  //   }
  // }
}

module.exports = Query;