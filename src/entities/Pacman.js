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
