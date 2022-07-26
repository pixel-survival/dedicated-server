const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { json } = require('body-parser');
const Users = require('./core/Users');
const Payload = require('./core/Payload');
const RequiredFields = require('./core/RequiredFields');
const responseService = require('./core/ResponseService');
const jwtService = require('./core/JwtService');
const log = require('./core/Log');
const config = require('./config/app');
const databases = require('./utils/Databases');
const server = express();
const users = new Users();

databases.connect();

server.use(helmet());
server.use(cors());
server.use(responseService.checkHeaders('content-type', ['POST']));
server.use(json());
server.use(responseService.checkInvalidJSON);

server.post('/auth/', async (request, response) => {
  const login = request.body.login.toLowerCase();
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

  if (user && await user.comparePassword(password)) {
    const token = jwtService.createToken({ id: user.id });

    payload.add('status', 'success');
    payload.add('data', { token });
  } else {
    payload.add('status', 'error');
    payload.add('message', 'Invalid login or password.');
  }

  response.send(payload.get());
});

server.listen(config.server.login.port, config.server.login.host, async () => {
  log.info(`Login server listening on ${config.server.login.host}:${config.server.login.port}`);
});

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use ${config.server.login.host}:${config.server.login.port}`);
    process.exit();
  }
});