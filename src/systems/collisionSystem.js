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
