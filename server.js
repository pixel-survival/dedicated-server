const express = require('express');
const mysql = require('mysql2');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { json } = require('body-parser');

const Driver = require('./core/Driver');
const Query = require('./core/Query');
const Payload = require('./core/Payload');
const RequiredFields = require('./core/RequiredFields');
const ServiceResponse = require('./core/ServiceResponse');
const TypeConverter = require('./core/TypeConverter');
const log = require('./core/Log');

const config = require('./config/app');

// init
const db = mysql.createPool(config.db.mysql);
const app = express();
const driver = new Driver('mysql', db);
const query = new Query(driver);
const serviceResponse = new ServiceResponse();
const typeConverter = new TypeConverter();

app.use(helmet());
app.use(cors());
app.use(serviceResponse.checkHeaders('content-type', ['POST']));
app.use(json());
app.use(serviceResponse.checkInvalidJSON);

app.post('/auth/', async (request, response) => {
  const login = request.body.login;
  const password = request.body.password;
  const payload = new Payload();
  const requiredFields = new RequiredFields(RequiredFields.auth.login, { login, password });
    
  if (!requiredFields.state) {
    payload.add('status', 'error');
    payload.add('message', requiredFields.message);
    response.send(payload.get());

    return;
  }
  
  const row = await query.getRowByField('users', 'login', login, ['id', 'login', 'password']);

  if (row) {
    if (password === row.password) {
      const token = jwt.sign({ id: row.id }, 'key');

      payload.add('status', 'success');
      payload.add('data', { token });
    } else {
      payload.add('status', 'error');
      payload.add('message', 'Invalid password.');
    }
  } else {
    payload.add('status', 'error');
    payload.add('message', 'User not found.');
  }

  response.send(payload.get());
});

app.listen(config.server.port, config.server.host, async () => {
  log.info(`Server listening on ${config.server.host}:${config.server.port}`);
});

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use ${config.server.host}:${config.server.port}`);
  }
});