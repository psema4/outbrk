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
