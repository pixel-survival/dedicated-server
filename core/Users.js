const db = require('./db');

class Users {
  async find(field, value) {
    const row = await db.query.getRowByField('users', field, value);

    if (row) {
      return row;
    } else {
      return false;
    }
  }
}

module.exports = Users;