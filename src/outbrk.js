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
