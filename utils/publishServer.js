const config = require('./../config/app');
const log = require('./../core/Log');

function publishServer() {
  const fetch = require('node-fetch');
  const server = {
    port: config.server.game.port,
    name: config.server.name,
    playersMax: 32
  }
  const params = {
    method: 'POST',
    body: JSON.stringify(server),
    headers: {
      'content-type': 'application/json'
    }
  }

  fetch(`http://${config.server.master.host}:${config.server.master.port}/server/add/`, params).then(response => {
    return response.json();
  }).then(response => {
    if (response.status === 'success') {
      log.info(`Server is published on the master server on ${config.server.master.host}:${config.server.master.port}`);
    } else {
      log.error(response.message);
    }
  }).catch((e) => {
    log.error(`Master server on ${config.server.master.host}:${config.server.master.port} unavailable`);
  })
}

module.exports = publishServer;