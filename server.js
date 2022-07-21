const express = require('express');
const mysql = require('mysql2');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { json } = require('body-parser');

const Users = require('./core/Users');
const Payload = require('./core/Payload');
const RequiredFields = require('./core/RequiredFields');
const ServiceResponse = require('./core/ServiceResponse');
const TypeConverter = require('./core/TypeConverter');
const log = require('./core/Log');
const config = require('./config/app');
const db = require('./core/db');

// init
const app = express();
const users = new Users();
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

  const user = await users.find('login', login);

  if (user && user.password === password) {
    const token = jwt.sign({ id: user.id }, 'key');
    const response = await db.query.updateRow('users', user.id, { token });

    if (response) {
      payload.add('status', 'success');
      payload.add('data', { token: response.token });
    } else {
      payload.add('status', 'error');
      payload.add('message', 'User update error.');
    }
  } else {
    payload.add('status', 'error');
    payload.add('message', 'Invalid login or password.');
  }

  response.send(payload.get());
});

app.listen(config.server.port, config.server.host, async () => {
  log.info(`Login server listening on ${config.server.host}:${config.server.port}`);
});

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use ${config.server.host}:${config.server.port}`);
  }
});