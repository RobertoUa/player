var C = require('./constants.js');

// Events
// -----------------------------------------------------------------------------
C.__enmap = {};

function registerEvent(id, name, value) {
    C[id] = value;
    C.__enmap[value] = name;
}


// TODO: use EventEmitter
// FIXME: all errors below were AnimErr instances

// adds specified events support to the `subj` object. `subj` object receives
// `handlers` property that keeps the listeners for each event. Also, it gets
// `e_<evt_name>` function for every event provided to call it when it is
// required to call all handlers of all of thise event name
// (`fire('<evt_name>', ...)` is the same but can not be reassigned by user).
// `subj` can define `handle_<evt_name>` function to handle concrete event itself,
// but without messing with other handlers.
// And, user gets `on` function to subcribe to events and `provides` to check
// if it is allowed.
function provideEvents(subj, events) {
    subj.prototype._initHandlers = (function(evts) { // FIXME: make automatic
        return function() {
            var _hdls = {};
            this.handlers = _hdls;
            for (var ei = 0, el = evts.length; ei < el; ei++) {
                _hdls[evts[ei]] = [];
            }
        };
    })(events);
    subj.prototype.on = function(event, handler) {
        if (!this.handlers) throw new Error('Instance is not initialized with handlers, call __initHandlers in its constructor');
        if (!this.provides(event)) throw new Error('Event \'' + C.__enmap[event] +
                                                     '\' not provided by ' + this);
        if (!handler) throw new Error('You are trying to assign ' +
                                        'undefined handler for event ' + event);
        this.handlers[event].push(handler);
        // FIXME: make it chainable, use handler instance to unbind, instead of index
        return (this.handlers[event].length - 1);
    };
    subj.prototype.fire = function(event/*, args*/) {
        if (!this.handlers) throw new Error('Instance is not initialized with handlers, call __initHandlers in its constructor');
        if (!this.provides(event)) throw new Error('Event \'' + C.__enmap[event] +
                                                     '\' not provided by ' + this);
        if (this.disabled) return;
        var evt_args = Array.prototype.slice.call(arguments, 1);
        if (this.handle__x && !(this.handle__x.apply(this, arguments))) return;
        var name = C.__enmap[event];
        if (this['handle_'+name]) this['handle_'+name].apply(this, evt_args);
        var _hdls = this.handlers[event];
        for (var hi = 0, hl = _hdls.length; hi < hl; hi++) {
            _hdls[hi].apply(this, evt_args);
        }
    };
    subj.prototype.provides = (function(evts) {
        return function(event) {
            if (!this.handlers) throw new Error('Instance is not initialized with handlers, call __initHandlers in its constructor');
            if (!event) return evts;
            return this.handlers.hasOwnProperty(event);
        }
    })(events);
    subj.prototype.unbind = function(event, idx) {
        if (!this.handlers) throw new Error('Instance is not initialized with handlers, call __initHandlers in its constructor');
        if (!this.provides(event)) throw new Error('Event ' + event +
                                                     ' not provided by ' + this);
        if (this.handlers[event][idx]) {
            this.handlers[event].splice(idx, 1);
        } else {
            throw new Error('No such handler ' + idx + ' for event ' + event);
        }
    };
    subj.prototype.disposeHandlers = function() {
        if (!this.handlers) throw new Error('Instance is not initialized with handlers, call __initHandlers in its constructor');
        var _hdls = this.handlers;
        for (var evt in _hdls) {
            if (_hdls.hasOwnProperty(evt)) _hdls[evt] = [];
        }
    }
    /* FIXME: call fire/e_-funcs only from inside of their providers, */
    /* TODO: wrap them with event objects */
    var _event;
    for (var ei = 0, el = events.length; ei < el; ei++) {
        _event = events[ei];
        subj.prototype['e_'+_event] = (function(event) {
            return function(evtobj) {
                this.fire(event, evtobj);
            };
        })(_event);
    }
}


registerEvent('S_NEW_PLAYER', 'new_player', 'new_player');
registerEvent('S_PLAYER_DETACH', 'player_detach', 'player_detach');

module.exports = {
  registerEvent: registerEvent,
  provideEvents: provideEvents
};
