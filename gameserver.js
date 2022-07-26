const config = require('./config/app');
const { Server } = require('socket.io');
const cache = require('./core/Cache');
const jwtService = require('./core/JwtService');
const databases = require('./utils/Databases');
const server = new Server(config.server.game.socket);

databases.connect();

server.on('connection', socket => {
  const token = socket.handshake.query.token;
  const verified = jwtService.verify(token);

  console.log(verified);
  socket.emit('auth', 'success');
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