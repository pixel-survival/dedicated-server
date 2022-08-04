const database = require('./Database');
const User = require('./User');

class Users {
  async find(field, value, fields) {
    const row = await database.getRowByField('users', field, value, fields);

    if (row) {
      const user = new User(row);

      return user;
    } else {
      return false;
    }
  }
}

module.exports = Users;