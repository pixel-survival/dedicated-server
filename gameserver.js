const config = require('./config/app');
const { Server } = require('socket.io');
const Users = require('./core/Users');
const jwtService = require('./core/JwtService');
const databases = require('./utils/Databases');
const users = new Users();
const server = new Server(config.server.game.socket);

databases.connect();

server.on('connection', async socket => {
  const token = socket.handshake.query.token;
  const verified = jwtService.verify(token);
  const user = await users.find('id', verified.userId, ['id', 'login', 'x', 'y']);

  socket.emit('auth', {
    user: {
      id: user.id,
      login: user.login,
      x: user.x,
      y: user.y
    }
  });
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