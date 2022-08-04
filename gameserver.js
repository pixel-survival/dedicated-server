const config = require('./config/app');
const { Server } = require('socket.io');
const cache = require('./core/Cache');
const jwtService = require('./core/JwtService');
const databases = require('./utils/Databases');
const database = require('./core/Database');
const server = new Server(config.server.game.socket);

databases.connect();

server.on('connection', async socket => {
  const token = socket.handshake.query.token;
  const verified = jwtService.verify(token);
  const user = await database.getRowByField('users', 'id', verified.id, ['login', 'x', 'y']);

  console.log(user);
  socket.emit('auth', user);
  // try {
    

  //   if (verified) {
  //     socket.emit('auth', 'success');
  //   }
  // } catch {
  //   socket.emit('auth', 'error verify');
  // }
});

server.listen(7777);

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use ${config.server.login.host}:${config.server.login.port}`);
    process.exit();
  }
});