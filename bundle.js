(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function MessageBus() {
    var handlers = {};

    function subscribe(eventName, cb) {
        if (! handlers.hasOwnProperty(eventName)) {
            handlers[eventName] = [];
        }

        handlers[eventName].push(cb);
    }

    function unsubscribe(eventName, cb) {
        //FIXME: stub
    }

    function publish(eventName, opts) {
        var callbacks = handlers[eventName];
        if (callbacks) {
            [].forEach.call(callbacks, function(callback) {
                callback(opts);
            });
        }
    }

    return {
        subscribe: subscribe
//      , unsubscribe: unsubscribe
      , publish: publish
    }
}

module.exports = MessageBus;

},{}],2:[function(require,module,exports){
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
        entity.msgbus.publish('collision', { entity: entity, other: other });
    }
};

module.exports = Collideable;

},{"../systems/collisionSystem":10}],3:[function(require,module,exports){
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

},{"../systems/moverSystem":11}],4:[function(require,module,exports){
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

},{"../systems/renderSystem":12}],5:[function(require,module,exports){
var Renderable = require('../components/Renderable')
  , Moveable = require('../components/Moveable')
  , Collideable = require('../components/Collideable')
  , x = 0.00    // percentages
  , y = 0.00
  , SPEED = 0.004
  , RADIUS = 0.01
;

function Ball(opts) {
    opts = opts || {};

    this.name = opts.name || 'Ball';
    this.isActive = true;
    this.msgbus = opts.msgbus;

    this.x = opts.x || x;
    this.y = opts.y || y;
    this.radius = opts.radius || RADIUS;

    //FIXME: make collision bounds more clear
    this.width = opts.width || 0.02;
    this.height = opts.height || 0.02;

    this.xSpeed = opts.xSpeed || SPEED;
    this.ySpeed = opts.ySpeed || SPEED;

    this.renderOpts = opts.renderOpts || {
        type: 'circle'

      , fillStyle: {
            type: 'colour'
          , colour: 'red'
        }
    };

    this.collisionOpts = opts.collisionOpts || {
        type: 'box'
      , action: 'deflect'
      , speedProp: 'ySpeed'
    }

    new Renderable(this);
    new Moveable(this);
    new Collideable(this);
}

module.exports = Ball;

},{"../components/Collideable":2,"../components/Moveable":3,"../components/Renderable":4}],6:[function(require,module,exports){
var Renderable = require('../components/Renderable')
  , Moveable = require('../components/Moveable')
  , Collideable = require('../components/Collideable')
  , x = 0.10    // percentages
  , y = 0.10
  , SPEED = 0.0025
  , WIDTH = 0.035
  , HEIGHT = 0.05
;

function Pacman(opts) {
    opts = opts || {};

    this.name = opts.name || 'Pacman';
    this.isActive = true;
    this.msgbus = opts.msgbus;

    this.x = opts.x || x;
    this.y = opts.y || y;
    this.width = opts.width || WIDTH;
    this.height = opts.height || HEIGHT;
    this.xSpeed = opts.xSpeed || SPEED;
    this.ySpeed = opts.ySpeed || SPEED;

    this.renderOpts = opts.renderOpts || {
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

    this.collisionOpts = opts.collisionOpts || {
        type: 'box'
      , action: 'deflect'
      , speedProp: 'ySpeed'
    }

    new Renderable(this);
    new Moveable(this);
    new Collideable(this);
}

module.exports = Pacman;

},{"../components/Collideable":2,"../components/Moveable":3,"../components/Renderable":4}],7:[function(require,module,exports){
var Renderable = require('../components/Renderable')
  , Moveable = require('../components/Moveable')
  , Collideable = require('../components/Collideable')
  , x = 1.10    // percentages
  , y = 1.00
  , SPEED = -0.004
  , RADIUS = 0.02
;

function Player(opts) {
    opts = opts || {};

    this.name = opts.name || 'Player';
    this.isActive = true;
    this.msgbus = opts.msgbus;

    this.x = opts.x || x;
    this.y = opts.y || y;
    this.radius = opts.radius || RADIUS;

    //FIXME: make collision bounds more clear
    this.width = opts.width || 0.04;
    this.height = opts.height || 0.04;

    this.xSpeed = opts.xSpeed || SPEED;
    this.ySpeed = opts.ySpeed || SPEED;

    this.renderOpts = opts.renderOpts || {
        type: 'circle'

      , fillStyle: {
            type: 'colour'
          , colour: 'blue'
        }
    };

    this.collisionOpts = opts.collisionOpts || {
        type: 'box'
      , action: 'deflect'
      , speedProp: 'ySpeed'
    }


    new Renderable(this);
    new Moveable(this);
    new Collideable(this);
}

module.exports = Player;

},{"../components/Collideable":2,"../components/Moveable":3,"../components/Renderable":4}],8:[function(require,module,exports){
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

},{"./entities/Ball":5,"./entities/Pacman":6,"./entities/Player":7}],9:[function(require,module,exports){
var outbrk = function(opts) {
        opts = opts || {};

            // core
        var ObjectPool = require('./objectPool')
          , MessageBus = require('./MessageBus')

            // systems
          , renderSystem = require('./systems/renderSystem')
          , moverSystem = require('./systems/moverSystem')
          , collisionSystem = require('./systems/collisionSystem')

            // entities/prefabs
          , Ball = require('./entities/Ball')
          , Player = require('./entities/Player')
          , Pacman = require('./entities/Pacman')

            // configurables
          , msgbus = opts.msgbus || new MessageBus()
          , objectPool = opts.objectPool || new ObjectPool()

          , createPool = opts.createPool || function(pool) {
                pool.ball = new Ball({ x: 0.15, msgbus: msgbus });
                pool.player = new Player({ msgbus: msgbus });
                pool.pacman = new Pacman({ msgbus: msgbus });
            }

            // rendering setup
          , $ = function(sel) { return document.querySelector(sel); }
          , $$ = function(sel) { return document.querySelectorAll(sel); }
          , $canvas = $('canvas')
          , ctx2d = $canvas.getContext('2d')
          , viewport = { width: $canvas.width, height: $canvas.height }
        ;

        // setup engine interface
        this.msgbus = msgbus;
        this.viewport = viewport;
        this.objectPool = objectPool;
        this.prefabs = {
            Ball: Ball
          , Player: Player
          , Pacman: Pacman
        };

        // init and run
        if (renderSystem.init({ msgbus: msgbus, context: ctx2d, viewport: viewport })) {
            moverSystem.init({ msgbus: msgbus });
            collisionSystem.init({ msgbus: msgbus });

            objectPool.create(createPool);

            collisionSystem.setPlayer(objectPool.get('player'));

            msgbus.publish('gameStart');

            function gameloop() {
                var pool = objectPool.getPool();

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
    }
;

module.exports = outbrk;

},{"./MessageBus":1,"./entities/Ball":5,"./entities/Pacman":6,"./entities/Player":7,"./objectPool":8,"./systems/collisionSystem":10,"./systems/moverSystem":11,"./systems/renderSystem":12}],10:[function(require,module,exports){
module.exports = {
    init: function(opts) {
        opts = opts || {};
        this.components = [];
        this.msgbus = opts.msgbus;
    }

  , register: function(component) {
        this.components.push(component);
        this.msgbus.publish('componentRegistered', { system: 'collisionSystem', component: component });
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

},{}],11:[function(require,module,exports){
module.exports = {
    init: function(opts) {
        opts = opts || {};
        this.components = [];
        this.msgbus = opts.msgbus;
    },

    register: function(component) {
        this.components.push(component);
        this.msgbus.publish('componentRegistered', { system: 'moverSystem', component: component });
    },

    invoke: function() {
        [].forEach.call(this.components, function(component) {
            component.invoke();
        });
    }
}

},{}],12:[function(require,module,exports){
module.exports = {
    init: function(opts) {
        if (!opts || !opts.context || !opts.viewport ) {
            console.warn('render system failed to initialize, a context & viewport are required');
            return false;
        }

        this.components = [];
        this.context = opts.context;
        this.viewport = opts.viewport; 
        this.msgbus = opts.msgbus;

        return true;
    },

    register: function(component) {
        this.components.push(component);
        this.msgbus.publish('componentRegistered', { system: 'renderSystem', component: component });
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

},{}],13:[function(require,module,exports){
var outbrk = require('../src/outbrk')
  , MessageBus = require('../src/MessageBus')
  , ObjectPool = require('../src/objectPool')
;

window.addEventListener('load', function() {
    console.log('load');

/*
    var msgbus = new MessageBus()
      , objectPool = new ObjectPool({ msgbus: msgbus })
    ;

    msgbus.subscribe('componentRegistered', function(opts) {
        console.log('%s registered component:', opts.systemName, opts.component);
    });

    msgbus.subscribe('collision', function(opts) {
        console.log('collision between entity, other:', opts.entity, opts.other);
    });

    msgbus.subscribe('gameStart', function() {
        console.log('game starting!');
    });


    window.game = new outbrk({ objectPool: objectPool, msgbus: msgbus });
*/

    window.game = new outbrk();
});

},{"../src/MessageBus":1,"../src/objectPool":8,"../src/outbrk":9}]},{},[13]);
