const libs = require('./../utils/Libs');

class Tasks {
  constructor() {
    this._objectIDs = {};
  }

  move(objectId, startX, startY, endX, endY, speed, callback) {
    const DEST_AREA = 3 * speed;
    const TICK_TIME = 10;
    let x1 = startX;
    let y1 = startY;
    let x2 = endX;
    let y2 = endY;

    this._register(objectId, 'move');
    this._tick(onTick, TICK_TIME, onBeforeTimeout.bind(this));

    function onTick() {
      const atan2 = Math.atan2(y1 - y2, x1 - x2);
      const angle = Math.floor(atan2 * (180 / Math.PI) + 180);
      const deltaX = Math.abs(x1 - x2);
      const deltaY = Math.abs(y1 - y2);
      const cos = Math.cos(angle * Math.PI / 180) * speed;
      const sin = Math.sin(angle * Math.PI / 180) * speed;
      
      x1 = libs.fixedNumber(x1 + cos, 1);
      y1 = libs.fixedNumber(y1 + sin, 1);

      if (deltaX < DEST_AREA && deltaY < DEST_AREA ) {
        callback(x1, y1, 'finished');

        return false;
      } else {
        callback(x1, y1, 'running');
      }
    }

    function onBeforeTimeout(timeout) {
      this._updateTimeoutInstance(objectId, 'move', timeout);
      
      callback(x1, y1, 'finished');
    }
  }

  stop(objectId, task) {
    if (this._objectIDs[objectId] && this._objectIDs[objectId][task]) {
      clearTimeout(this._objectIDs[objectId][task].timeout);
    }
  }

  _register(objectId, task) {
    if (!this._objectIDs[objectId]) { 
      this._objectIDs[objectId] = {}
      this._objectIDs[objectId][task] = {
        timeout: null
      }
    }
  }

  _updateTimeoutInstance(objectId, task, timeout) {
    this._objectIDs[objectId][task].timeout = timeout;
  }

  _tick(callback, time, timeoutCallback) {
    const timeout = setTimeout(() => {
      const response = callback();

      if (response === false) {
        return;
      }

      this._tick(callback, time, timeoutCallback);
    }, time);

    timeoutCallback(timeout);
  }
}

module.exports = Tasks;