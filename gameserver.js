const { Server } = require('socket.io');
const io = new Server({ cors: { origin: "*" } });
const cache = require('./core/Cache');
const config = require('./config/app');
const jwtService = require('./core/JwtService');

cache.connect(config.db.redis).then(async connected => {
  if (connected) {
    jwtService.secretKey = await cache.get('jwt:secretkey');
  }
});

io.on('connection', socket => {
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

io.listen(7777);