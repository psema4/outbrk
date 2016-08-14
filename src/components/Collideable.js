var collisionSystem = require('../systems/collisionSystem');

function Collideable(entity) {
	this.entity = entity;
	collisionSystem.register(this);
}

Collideable._actions = {
	deflect(opts) {
        opts = opts || {};

        var other = opts.other
          , entity = opts.entity
          , speedProp = opts.speedProp
        ;

		other[speedProp] *= -1;
	},

	deactivate(opts) {
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

Collideable.prototype.invoke = function(other) {
	var entity = this.entity
	  , isActive = entity && entity.isActive
      , collisionOptions = this.entity.collisionOpts
	  , type = collisionOptions.type
      , speedProp = collisionOptions.speedProp
    ;

	if (!isActive) return;

	var closestX = Collideable._getClosestPoint({ 
	        point: other.x - (entity.radius*640) //FIXME: need viewport info
	      , minimum: entity.x
		  , maximum: entity.x + entity.width
	    })

	  , closestY = Collideable._getClosestPoint({ 
		    point: other.y - (entity.radius*480) //FIXME: need viewport info
		  , minimum: entity.y
		  , maximum: entity.y + entity.height
	    })

	  , distanceX = other.x - closestX
	  , distanceY = other.y - closestY
	  , distanceSquared = distanceX * distanceX + distanceY * distanceY

	  , hasIntersect = distanceSquared < entity.radius * entity.radius
    ;

	if (hasIntersect) Collideable._actions[type]({ other: other, entity: entity, speedProp: speedProp });

var debug = false;
if (debug && hasIntersect) {
  console.log('collideable: entity, other:', entity, other);
  console.log('entity.x: %s, entity.y: %s', entity.x, entity.y);
  console.log('other.x: %s, other.y', other.x, other.y);
  console.log('closestX: %s, closestY: %s', closestX, closestY);
  console.log('distanceX: %s, distanceY: %s', distanceX, distanceY);
  console.log('hasIntersect? %s, distanceSquared = %s, radius^2 = %s', hasIntersect, distanceSquared, (entity.radius*entity.radius));
  console.log('')
  //debugger;
}
};

module.exports = Collideable;
