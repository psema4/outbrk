var Ball = require('./entities/Ball')
  , Player = require('./entities/Player')
  , Pacman = require('./entities/Pacman')
  , pool = {}
;

function ObjectPool(opts) {
    opts = opts || {};

    this.msgbus = opts.msgbus;
}

ObjectPool.prototype.get = function(key) {
    return pool[key];
};

ObjectPool.prototype.set = function(key, obj) {
    pool[key] = obj;
}

ObjectPool.prototype.getPool = function() {
    return pool;
};

ObjectPool.prototype.create = function(fn) {
    if (fn && typeof fn === 'function') {
        fn(pool);
    }
}

module.exports = ObjectPool;
