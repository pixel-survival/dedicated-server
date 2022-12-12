const config = require('./config/app');
const { Server } = require('socket.io');
const Users = require('./core/Users');
const Tasks = require('./core/Tasks');
const Players = require('./core/Players');
const log = require('./core/Log');
const jwtService = require('./core/JwtService');
const databases = require('./utils/Databases');
const setMinRequestTime = require('./utils/setMinRequestTime');
const publishServer = require('./utils/publishServer');
const users = new Users();
const tasks = new Tasks();
const players = new Players();
const server = new Server(config.server.game.socket);

setMinRequestTime(server, config.server.game.minRequestTime);

server.on('connection', async socket => {
  const token = socket.handshake.query.token;
  const verified = jwtService.verify(token);
  const user = await users.find('id', verified.userId, ['id', 'login', 'x', 'y']);

  if (verified) {
    socket.on('world:enter', () => {
      const player = players.add(user);
      const payload = {
        welcome: {
          player,
          players: players.getPlayersExceptId(user.id)
        },
        entered: {
          player
        }
      }

      socket.emit('world:welcome', payload.welcome);
      socket.broadcast.emit('world:entered', payload.entered);
    });
    
    socket.on('player:move', data => {
      // user => player
      tasks.stop(user.id, 'move');
      tasks.move(user.id, user.x, user.y, data.x, data.y, 5, (x, y, status) => {
        if (status === 'finished') {
          user._x = x;
          user._y = y;
          
          server.emit('player:moving', { id: user.id, x, y });
        }

        server.emit('player:moving', { id: user.id, x, y });
      });
    });
  } else {
    socket.disconnect(true);
  }
});

server.listen(config.server.game.port);

server.httpServer.on('listening', () => {
  log.info(`Game server listening on localhost:${config.server.game.port}`);
});

databases.connect();

if (config.server.master.publish) {
  publishServer();
}

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use localhost:${config.server.game.port}`);
  } else {
    log.normal(error);
  }

  process.exit();
});