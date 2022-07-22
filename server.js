const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { json } = require('body-parser');

const Users = require('./core/Users');
const Payload = require('./core/Payload');
const RequiredFields = require('./core/RequiredFields');
const responseService = require('./core/ResponseService');
const passwordService = require('./core/PasswordService');
const jwtService = require('./core/JwtService');
const log = require('./core/Log');
const config = require('./config/app');
const db = require('./core/db');

// init
const app = express();
const users = new Users();

app.use(helmet());
app.use(cors());
app.use(responseService.checkHeaders('content-type', ['POST']));
app.use(json());
app.use(responseService.checkInvalidJSON);

app.post('/auth/', async (request, response) => {
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
    const data = await user.update({ token });

    if (data) {
      payload.add('status', 'success');
      payload.add('data', { token: data.token });
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