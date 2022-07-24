const { Server } = require('socket.io');
const io = new Server({ cors: { origin: "*" } });
const jwtService = require('./core/JwtService');
const { createClient } = require('redis');

//
const client = createClient();

client.on('error', (err) => {
  console.log('Redis Client Error')
  process.exit();
});
client.connect().then(async () => {
  //client.set('test', '123');
  const value = await client.get('test');

  //console.log(value)
});
//

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