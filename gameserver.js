const config = require('./config/app');
const { Server } = require('socket.io');
const Users = require('./core/Users');
const Tasks = require('./core/Tasks');

const jwtService = require('./core/JwtService');
const databases = require('./utils/Databases');
const setMinRequestTime = require('./utils/setMinRequestTime');
const users = new Users();
const tasks = new Tasks();
const server = new Server(config.server.game.socket);

databases.connect();

setMinRequestTime(server, config.server.game.minRequestTime);

server.on('connection', async socket => {
  const token = socket.handshake.query.token;
  const verified = jwtService.verify(token);
  const user = await users.find('id', verified.userId, ['id', 'login', 'x', 'y']);

  if (verified) {
    socket.on('world:enter', () => {
      socket.emit('world:entered', {
        user: {
          id: user.id,
          login: user.login,
          x: user.x,
          y: user.y
        }
      });
    });
    
    socket.on('player:move', data => {
      tasks.stop(user.id, 'move');
  
      tasks.move(user.id, user.x, user.y, data.x, data.y, 5, (x, y, status) => {
        if (status === 'finished') {
          user._x = x;
          user._y = y;
        }
  
        socket.emit('player:moving', { id: user.id, x, y});
      });
    });
  } else {
    socket.disconnect(true);
  }
});

server.listen(7777);

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use ${config.server.login.host}:${config.server.login.port}`);
    process.exit();
  }
});