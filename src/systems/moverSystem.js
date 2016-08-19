module.exports = {
    init: function(opts) {
        opts = opts || {};
        this.components = [];
        this.msgbus = opts.msgbus;
    },

    register: function(component) {
        this.components.push(component);
        this.msgbus.publish('componentRegistered', { system: 'moverSystem', component: component });
    },

    invoke: function() {
        [].forEach.call(this.components, function(component) {
            component.invoke();
        });
    }
}
