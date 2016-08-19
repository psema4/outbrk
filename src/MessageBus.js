function MessageBus() {
    var handlers = {};

    function subscribe(eventName, cb) {
        if (! handlers.hasOwnProperty(eventName)) {
            handlers[eventName] = [];
        }

        handlers[eventName].push(cb);
    }

    function unsubscribe(eventName, cb) {
        //FIXME: stub
    }

    function publish(eventName, opts) {
        var callbacks = handlers[eventName];
        if (callbacks) {
            [].forEach.call(callbacks, function(callback) {
                callback(opts);
            });
        }
    }

    return {
        subscribe: subscribe
//      , unsubscribe: unsubscribe
      , publish: publish
    }
}

module.exports = MessageBus;
