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
