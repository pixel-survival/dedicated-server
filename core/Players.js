class Players {
  constructor() {
    this._players = {};
  }

  add(user) {
    const player = {
      id: user.id,
      login: user.login,
      x: user.x,
      y: user.y
    }

    if (!this._players[user.id]) {
      this._players[user.id] = player;
    }

    return player;
  }

  getPlayers() {
    return Object.values(this._players);
  }

  getPlayersExceptId(id) {
    const players = Object.values(this._players);

    return players.filter(player => player.id !== id);
  }
}

module.exports = Players;