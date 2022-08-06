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

  let x = user.x;
  let y = user.y;

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

  class Task {
    move(x1, y1, x2, y2, callback) {
      const angle = Math.floor(Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI) + 180);
      
      const x = Number((x1 + Math.cos(angle * Math.PI / 180)).toFixed(1));
      const y = Number((y1 + Math.sin(angle * Math.PI / 180)).toFixed(1));

      console.log(x1, y1, x2,y2)
      // fix
      if (Math.abs(x1 - x2) < 3 && Math.abs(y1 - y2) < 3 ) {
        callback(x, y, 'finished');

        return;
      }

      setTimeout(() => {
        callback(x, y, 'running');

        this.move(x, y, x2, y2, callback);
      }, 50);
    }
  }

  const task = new Task();
  
  socket.on('player:move', data => {
    task.move(user.x, user.y, data.x, data.y, (x, y, status) => {
      if (status === 'finished') {
        user._x = x;
        user._y = y;
        console.log('finished')
      }

      socket.emit('player:moving', { id: user.id, x, y });
    });
  })
  
    

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