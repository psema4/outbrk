var Ball = require('./entities/Ball')
  , Player = require('./entities/Player')
  , Pacman = require('./entities/Pacman')
  , pool = {}
;

module.exports = {
    get: function(key) {
        return pool[key];
    }

  , getAll: function() {
      return pool;
    }

  , create: function() {
        pool.ball = new Ball();
        pool.player = new Player();
        pool.pacman = new Pacman();
    }
}
