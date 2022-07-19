class Payload {
  constructor() {
    this._data = {};
  }

  add(key, value) {
    this._data[key] = value;
  }

  get() {
    for(const key in this._data) {
      if (this._data[key] === null) {
        delete this._data[key];
      }
    }

    return this._data;
  }
}

module.exports = Payload;