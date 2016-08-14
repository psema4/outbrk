var Renderable = require('../components/Renderable')
  , Moveable = require('../components/Moveable')
  , x = 0.10    // percentages
  , y = 0.10
  , SPEED = 0.0025
  , WIDTH = 0.035
  , HEIGHT = 0.05
;

function Pacman() {
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

/* draw background for collision testing
                    ctx.fillStyle='red';
                    ctx.fillRect(x, y, opts.entity.width * vp.width, opts.entity.height * vp.height);    
*/
                    ctx.fillStyle='black';

                    // pacman
                    ctx.beginPath();
                    ctx.arc(x+(10), y+(10), 13, Math.PI/7, -Math.PI/7, false);
                    ctx.lineTo(x+(5), y+(10));
                    ctx.fill();
                }
            }
        }
    }

    new Renderable(this);
    new Moveable(this);
}

module.exports = Pacman;
