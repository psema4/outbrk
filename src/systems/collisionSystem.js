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

  , invoke: function() {
        var player = this.player;

        [].forEach.call(this.components, function(component) {
            component.invoke(player);
        });
    }
}
