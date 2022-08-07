const config = require('./config/app');
const { Server } = require('socket.io');
const Users = require('./core/Users');
const libs = require('./utils/Libs');
const jwtService = require('./core/JwtService');
const databases = require('./utils/Databases');
const users = new Users();
const server = new Server(config.server.game.socket);

databases.connect();

server.on('connection', async socket => {
  const token = socket.handshake.query.token;
  const verified = jwtService.verify(token);
  const user = await users.find('id', verified.userId, ['id', 'login', 'x', 'y']);

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

  class Tasks {
    constructor() {
      this._objectIDs = {};
    }

    move(id, startX, startY, endX, endY, callback) {
      const DEST_AREA = 3;
      let x1 = startX;
      let y1 = startY;
      let x2 = endX;
      let y2 = endY;

      this._register(id, 'move');

      this._tick(() => {
        if (this._objectIDs[id] && this._objectIDs[id]['move'] === 'end') {
          //
          user._x = x1;
          user._y = y1;
          //

          return false;
        }

        if (this._objectIDs[id] && this._objectIDs[id]['move'] === 'registered') {
          this._objectIDs[id]['move'] = 'in_progress';
        }

        const atan2 = Math.atan2(y1 - y2, x1 - x2);
        const angle = Math.floor(atan2 * (180 / Math.PI) + 180);
        const deltaX = Math.abs(x1 - x2);
        const deltaY = Math.abs(y1 - y2);
        const cos = Math.cos(angle * Math.PI / 180);
        const sin = Math.sin(angle * Math.PI / 180);
        
        x1 = libs.fixedNumber(x1 + cos, 1);
        y1 = libs.fixedNumber(y1 + sin, 1);

        if (deltaX < DEST_AREA && deltaY < DEST_AREA ) {
          callback(x1, y1, 'finished');
  
          return false;
        }

        callback(x1, y1, 'running');
      }, 10);
    }

    stop(id, task) {
      if (this._objectIDs[id] && this._objectIDs[id][task]) {
        this._objectIDs[id][task] = 'end';
      }
    }

    _register(id, task) {
      if (!this._objectIDs[id]) { 
        this._objectIDs[id] = {}
      }

      this._objectIDs[id][task] = 'registered';
    }

    _tick(callback, time) {
      setTimeout(() => {
        const response = callback();

        if (response === false) {
          return;
        }

        this._tick(callback, time);
      }, time);
    }
  }

  const tasks = new Tasks();
  
  socket.on('player:move', data => {
    tasks.stop(user.id, 'move');
    //
    setTimeout(() => {
      tasks.move(user.id, user.x, user.y, data.x, data.y, (x, y, status) => {
        if (status === 'finished') {
          user._x = x;
          user._y = y;
        }
  
        socket.emit('player:moving', { id: user.id, x, y });
      });
    }, 10);
    //
  });
  
    

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