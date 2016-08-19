(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    }
};

module.exports = Collideable;

},{"../systems/collisionSystem":9}],2:[function(require,module,exports){
var moverSystem = require('../systems/moverSystem');

function Moveable(entity) {
    this.entity = entity;
    moverSystem.register(this);
}

Moveable.prototype.invoke = function() {
    var entity = this.entity;

    if (!entity.isActive) return;

    entity.x += entity.xSpeed;
    entity.y += entity.ySpeed;
}

module.exports = Moveable;

},{"../systems/moverSystem":10}],3:[function(require,module,exports){
var renderSystem = require('../systems/renderSystem');

function Renderable(entity) {
    this.entity = entity;
    renderSystem.register(this);
}

Renderable._types = {
    rectangle: function(opts) {
        opts = opts || {};

        var projectedX = opts.entity.x * opts.viewport.width
          , projectedY = opts.entity.y * opts.viewport.height
          , projectedWidth = opts.entity.width * opts.viewport.width
          , projectedHeight = opts.entity.height * opts.viewport.height
        ;

        opts.context.fillRect(projectedX, projectedY, projectedWidth, projectedHeight);
    }

  , circle: function(opts) {
        opts = opts || {};

        var projectedX = opts.entity.x * opts.viewport.width
          , projectedY = opts.entity.y * opts.viewport.height
          , projectedRadius = opts.entity.radius * opts.viewport.width
          , _fillStyle = opts.context.fillStyle
        ;

        opts.context.fillStyle = _fillStyle;
        opts.context.beginPath();
        opts.context.arc(projectedX, projectedY, projectedRadius, 0, Math.PI * 2);
        opts.context.fill();
    }

  , geometry: function(opts) {
        opts = opts || {};

        var geometry = opts.entity;

        opts.context.beginPath();

        [].forEach.call(geometry, function(point) {
            opts.context.lineTo(point.x * opts.viewport.width, point.y * opts.viewport.height);
        });

        opts.context.fill();
    }

  , surface: function() {
        /*  drawing handled in fillStyle, anything added here will be drawn overtop
            which may be useful for huds, life bars, tags, badges etc
        */
    }
};

Renderable._fillStyles = {
    colour: function(opts) {
        opts = opts || {};

        opts.context.fillStyle = opts.fillStyle.colour;
    }

  , gradient: function(opts) {
        opts = opts || {};

        var projectedX = opts.entity.x * opts.viewport.width
          , projectedY = opts.entity.y * opts.viewport.height
          , projectedHeight = opts.entity.height * opts.viewport.height
          , gradient = opts.context.createLinearGradient(projectedX, projectedY, projectedX, projectedY + projectedHeight)
        ;

        gradient.addColorStop(0, opts.fillStyle.firstStep);
        gradient.addColorStop(1, opts.fillStyle.secondStep);

        opts.context.fillStyle = gradient;
    }

  , pattern: function(opts) {
        opts = opts || {};

        var pattern = opts.context.createPattern(opts.fillStyle.source, 'repeat');

        opts.context.fillStyle = pattern;
    }

  , drawable: function(opts) {
        opts = opts || {};
        opts.fillStyle.draw(opts);
    }
};

Renderable._clearContext = function(opts) {
    opts = opts || {};

    var projectedX = entity.x * viewport.width
      , projectedY = entity.y * viewport.height
      , projectedWidth = entity.width * viewport.width
      , projectedHeight = entity.height * viewport.height
    ;

    opts.context.clearRect(projectedX, projectedY, projectedWidth, projectedHeight);
}

Renderable.prototype.invoke = function(context, viewport) {
    var entity = this.entity
      , renderOpts = entity.renderOpts
    ;

    if (!entity.isActive) return;

    Renderable._fillStyles[renderOpts.fillStyle.type]({
        entity: entity
      , fillStyle: renderOpts.fillStyle
      , context: context
      , viewport: viewport
    });

    Renderable._types[renderOpts.type]({
        entity: entity
      , context: context
      , viewport: viewport
    });
}

module.exports = Renderable;

},{"../systems/renderSystem":11}],4:[function(require,module,exports){
var Renderable = require('../components/Renderable')
  , Moveable = require('../components/Moveable')
  , Collideable = require('../components/Collideable')
  , x = 0.00    // percentages
  , y = 0.00
  , SPEED = 0.004
  , RADIUS = 0.01
;

function Ball() {
    this.name = 'Ball';
    this.isActive = true;

    this.x = x;
    this.y = y;
    this.radius = RADIUS;

    //FIXME: make collision bounds more clear
    this.width = 0.02;
    this.height = 0.02;

    this.xSpeed = SPEED;
    this.ySpeed = SPEED;

    this.renderOpts = {
        type: 'circle'

      , fillStyle: {
            type: 'colour'
          , colour: 'red'
        }
    };

    this.collisionOpts = {
        type: 'box'
      , action: 'deflect'
      , speedProp: 'ySpeed'
    }

    new Renderable(this);
    new Moveable(this);
    new Collideable(this);
}

module.exports = Ball;

},{"../components/Collideable":1,"../components/Moveable":2,"../components/Renderable":3}],5:[function(require,module,exports){
var Renderable = require('../components/Renderable')
  , Moveable = require('../components/Moveable')
  , Collideable = require('../components/Collideable')
  , x = 0.10    // percentages
  , y = 0.10
  , SPEED = 0.0025
  , WIDTH = 0.035
  , HEIGHT = 0.05
;

function Pacman() {
    this.name = 'Pacman';
    this.isActive = true;

    this.x = x;
    this.y = y;
    this.width = WIDTH;
    this.height = HEIGHT;
    this.xSpeed = SPEED;
    this.ySpeed = SPEED;

    this.renderOpts = {
        type: 'surface'

      , fillStyle: {
            type: 'drawable'

          , draw: function(opts) {
                if (opts.context) {
                    var ctx = opts.context
                      , vp = opts.viewport
                      , x = opts.entity.x * vp.width - (opts.entity.width / 2)
                      , y = opts.entity.y * vp.height - (opts.entity.height / 2)
                    ;

                    ctx.fillStyle='#FFDF00';

                    // pacman
                    ctx.beginPath();
                    ctx.arc(x+(10), y+(10), 13, Math.PI/7, -Math.PI/7, false);
                    ctx.lineTo(x+(5), y+(10));
                    ctx.fill();
                }
            }
        }
    }

    this.collisionOpts = {
        type: 'box'
      , action: 'deflect'
      , speedProp: 'ySpeed'
    }

    new Renderable(this);
    new Moveable(this);
    new Collideable(this);
}

module.exports = Pacman;

},{"../components/Collideable":1,"../components/Moveable":2,"../components/Renderable":3}],6:[function(require,module,exports){
/* The Player object should not use the current implementation of the Collideable 
 * component. *All collisions* are currently processed against the player
 */
var Renderable = require('../components/Renderable')
  , Moveable = require('../components/Moveable')
  , x = 1.10    // percentages
  , y = 1.00
  , SPEED = -0.004
  , RADIUS = 0.02
;

function Player() {
    this.name = 'Player';
    this.isActive = true;

    this.x = x;
    this.y = y;
    this.radius = RADIUS;

    //FIXME: make collision bounds more clear
    this.width = 0.04;
    this.height = 0.04;

    this.xSpeed = SPEED;
    this.ySpeed = SPEED;

    this.renderOpts = {
        type: 'circle'

      , fillStyle: {
            type: 'colour'
          , colour: 'blue'
        }
    };

    new Renderable(this);
    new Moveable(this);
}

module.exports = Player;

},{"../components/Moveable":2,"../components/Renderable":3}],7:[function(require,module,exports){
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

},{"./entities/Ball":4,"./entities/Pacman":5,"./entities/Player":6}],8:[function(require,module,exports){
var outbrk = function(opts) {
    opts = opts || {};

    var objectPool = opts.objectPool || require('./objectPool')
      , renderSystem = require('./systems/renderSystem')
      , moverSystem = require('./systems/moverSystem')
      , collisionSystem = require('./systems/collisionSystem')
      , $ = function(sel) { return document.querySelector(sel); }
      , $$ = function(sel) { return document.querySelectorAll(sel); }
      , $canvas = $('canvas')
      , ctx2d = $canvas.getContext('2d')
      , viewport = { width: $canvas.width, height: $canvas.height }
    ;

    if (renderSystem.init({ context: ctx2d, viewport: viewport })) {
        moverSystem.init();
        collisionSystem.init();

        objectPool.create();
        window.objectPool = objectPool;

        collisionSystem.setPlayer(objectPool.get('player'));

        function gameloop() {
            var pool = objectPool.getAll();

            ctx2d.clearRect(0, 0, viewport.width, viewport.height);
            moverSystem.invoke();

            collisionSystem.invoke(pool);
            renderSystem.invoke();

            requestAnimationFrame(gameloop);
        }

        gameloop();

    } else {
        console.warn('outbrk: unable to initialize');
    }
};

module.exports = outbrk;

},{"./objectPool":7,"./systems/collisionSystem":9,"./systems/moverSystem":10,"./systems/renderSystem":11}],9:[function(require,module,exports){
module.exports = {
    init: function() {
        this.components = [];

        console.log('collisionSystem initialized');
    }

  , register: function(component) {
        this.components.push(component);

        console.log('collisionSystem: registered component:', component);
    }

  , setPlayer: function(entity) {
        this.player = entity;
    }

  , invoke: function(pool) {
        var player = this.player
          , objects = Object.keys(pool)
        ;

        [].forEach.call(this.components, function(component) {
            [].forEach.call(objects, function(object) {
                component.invoke(pool[object]);
            });
        });
    }
}

},{}],10:[function(require,module,exports){
module.exports = {
    init: function() {
        this.components = [];

        console.log('moverSystem initialized');
    },

    register: function(component) {
        this.components.push(component);

        console.log('moverSystem: registered component:', component);
    },

    invoke: function() {
        [].forEach.call(this.components, function(component) {
            component.invoke();
        });
    }
}

},{}],11:[function(require,module,exports){
module.exports = {
    init: function(opts) {
        if (!opts || !opts.context || !opts.viewport ) {
            console.warn('render system failed to initialize, a context & viewport are required');
            return false;
        }

        this.components = [];
        this.context = opts.context;
        this.viewport = opts.viewport; 

        console.log('renderSystem initialized, using context & viewport:', this.context, this.viewport);
        return true;
    },

    register: function(component) {
        this.components.push(component);

        console.log('renderSystem: registered component:', component);
    },

    invoke: function() {
        var context = this.context
          , viewport = this.viewport
        ;

        [].forEach.call(this.components, function(component) {
            component.invoke(context, viewport);
        });
    }
}

},{}],12:[function(require,module,exports){
var outbrk = require('../src/outbrk')
  , objectPool = require('../src/objectPool')
;

window.addEventListener('load', function() {
    console.log('load');
    window.game = new outbrk({ objectPool: objectPool });
});

},{"../src/objectPool":7,"../src/outbrk":8}]},{},[12]);
