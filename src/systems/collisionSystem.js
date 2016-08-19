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
