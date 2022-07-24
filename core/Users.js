const db = require('./db');
const User = require('./User');

class Users {
  async find(field, value) {
    const row = await db.data.getRowByField('users', field, value);

    if (row) {
      const user = new User(row);

      return user;
    } else {
      return false;
    }
  }
}

module.exports = Users;