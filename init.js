const crypto = require('crypto');
const config = require('./config/app');
const cache = require('./core/Cache');
const log = require('./core/Log');
const secretKey = crypto.randomBytes(256).toString('base64');

cache.connect(config.db.redis).then(connected => {
  const host = config.db.redis.socket.host;
  const port = config.db.redis.socket.port;

  if (connected) {
    log.info(`Connected to cache on ${host}:${port}`);
    cache.set('jwt:secretkey', secretKey).then(() => {
      log.info('Completed successfully');
      process.exit();
    });
  } else {
    log.error(`Not connected to cache on ${host}:${port}`);
  }
});