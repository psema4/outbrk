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

        collisionSystem.setPlayer(objectPool.get('pacman'));

        function gameloop() {
            ctx2d.clearRect(0, 0, viewport.width, viewport.height);
            moverSystem.invoke();
            collisionSystem.invoke();
            renderSystem.invoke();

            //console.log('tick');
            requestAnimationFrame(gameloop);
        }

        gameloop();

    } else {
        console.warn('outbrk: unable to initialize');
    }
};

module.exports = outbrk;
