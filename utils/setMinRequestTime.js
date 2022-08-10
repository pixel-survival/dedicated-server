function setMinRequestTime(server, minRequestTime) {
  server.on('connection', socket => {
    const nativeSocketOnEvent = socket.onevent;
    
    socket.lastRequestsTime = {};
    socket.onevent = packet => {
      const packetType = packet.data[0];
      const currentRequestTime = Date.now();
      
      if (!socket.lastRequestsTime[packetType]) {
        socket.lastRequestsTime[packetType] = Date.now() - minRequestTime;
      }
      
      const requestTimeDiff = currentRequestTime - socket.lastRequestsTime[packetType];
      
      if (requestTimeDiff < minRequestTime) {
        return;
      } else {
        socket.lastRequestsTime[packetType] = currentRequestTime;
      }

      nativeSocketOnEvent.call(socket, packet);
    }
  });
}

module.exports = setMinRequestTime;