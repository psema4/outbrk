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
