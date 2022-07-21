const Driver = require('./Driver');
const Query = require('./Query');
const config = require('./../config/app');
const mysql = require('mysql2');
const db = mysql.createPool(config.db.mysql);
const driver = new Driver('mysql', db);
const query = new Query(driver);

module.exports = {
    query
}