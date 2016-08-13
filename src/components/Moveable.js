var moverSystem = require('../systems/moverSystem');

function Moveable(entity) {
    this.entity = entity;
    moverSystem.register(this);
}

Moveable.prototype.invoke = function() {
    var entity = this.entity;

    if (!entity.isActive) return;

    this.entity.x += entity.xSpeed;
    this.entity.y += entity.ySpeed;
}

module.exports = Moveable;
