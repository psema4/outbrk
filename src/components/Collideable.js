var collisionSystem = require('../systems/collisionSystem');

function Collideable(entity) {
	this.entity = entity;
	collisionSystem.register(this);
}

Collideable._actions = {
	deflect: function (opts) {
        opts = opts || {};

        var other = opts.other
          , entity = opts.entity
          , speedProp = opts.speedProp
        ;

        other[speedProp] *= -1;
	},

	deactivate: function(opts) {
        opts = opts || {};

        var other = opts.other
          , entity = opts.entity
          , speedProp = opts.speedProp
        ;

		entity.isActive = false;
		//this.deflect({ other: other, entity: entity, speedProp: speedProp });
	}
};

Collideable._getClosestPoint = function getPoint(opts) {
    opts = opts || {};

    var point = opts.point
      , minimum = opts.minimum
      , maximum = opts.maximum
    ;

	return Math.max(minimum, Math.min(maximum, point));
};

Collideable._getBoundingBox = function(entity) {
    function xProjection(x) {
        return x * 640; // FIXME: viewport width
    }

    function yProjection(y) {
        return y * 480; // FIXME: viewport height
    }

    var boundingBox = {
            x: xProjection(entity.x) - xProjection(entity.width)/2
          , y: yProjection(entity.y) - yProjection(entity.height)/2
          , w: xProjection(entity.width)
          , h: yProjection(entity.height)
        }
    ;

    return boundingBox;
};

Collideable.prototype.invoke = function(other) {
	var entity = this.entity
	  , isActive = entity.isActive
      , collisionOptions = entity.collisionOpts
	  , action = collisionOptions.action
      , speedProp = collisionOptions.speedProp
      , hasIntersect = false
    ;

	if (!isActive || ! (other && other.name) || other.name === entity.name) return;

    switch (collisionOptions.type) {
        case 'circle':
            var closestX = Collideable._getClosestPoint({
                    point: other.x + (other.width/2 * 640) // FIXME: viewport width
                  , minimum: entity.x
                  , maximum: entity.x + entity.radius/2
                })

              , closestY = Collideable._getClosestPoint({
                    point: other.y + (other.height/2 * 480) // FIXME: viewport height
                  , minimum: entity.y
                  , maximum: entity.y + entity.radius/2
                })

    	      , distanceX = other.x - closestX
	          , distanceY = other.y - closestY
        	  , distanceSquared = distanceX * distanceX + distanceY * distanceY
            ;

        	hasIntersect = distanceSquared < entity.radius * entity.radius
            break;

        case 'box':
        default:
            var boxEntity = Collideable._getBoundingBox(entity)
              , boxOther = Collideable._getBoundingBox(other)
            ;

            hasIntersect = (
                boxEntity.x < boxOther.x + boxOther.w  &&
                boxEntity.x + boxEntity.w > boxOther.x &&
                boxEntity.y < boxOther.y + boxOther.h  &&
                boxEntity.y + boxEntity.h > boxOther.y
            );
    }

	if (hasIntersect) {
        Collideable._actions[action]({ other: other, entity: entity, speedProp: speedProp });
        entity.msgbus.publish('collision', { entity: entity, other: other });
    }
};

module.exports = Collideable;
