/**
 * Event Emitter
 * Event handling library that support wildcard events.
 *
 * @constructor
 * @example
 *    var emitter = new EventEmitter();
 *    var log = function(event, data){
 *      console.log(event, data)
 *    };
 *    emitter.on('data.user', log);
 *    emitter.on('data.project', log);
 *    emitter.on('data.*', log);
 *
 *    emitter.emit('data.user', {uid:1});
 *    // print: data.user Object {uid: 1}
 *    // print: data.user Object {uid: 1}
 *
 *    emitter.emit('data.branch', {bid:1});
 *    // print: data.branch Object {bid: 1}
 */

function EventEmitter() {}

/**
 * Subscribe to an event
 *
 * @param {String} event
 * @param {Function} callback
 */

EventEmitter.prototype.on = function(event, callback) {
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || []).push(callback);
  return this;
};

/**
 * Emit an event
 *
 * Callbacks that meet the event name
 * or if the event subscribe is a wildcard
 * subscription will get call with the
 * parameters pass in to the `emit` function
 *
 * The first parameter pass into the callback
 * will be the event that we are emitting,
 * following parameters will be the data
 *
 * @param {String} event
 * @param {Object|Number|String|Boolean} data1, data2, dataN
 */

EventEmitter.prototype.emit = function(event /*, data1, data2, dataN */) {
  var callbacks = [];
  var events = this.eventObjectize(event);
  for (var id in events) {
    callbacks = callbacks.concat(this._callbacks[events[id]] || []);
  }

  if (callbacks.length > 0) {
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, arguments);
    }
  }
  return this;
};


/**
 * Extract possible events from the given string
 *
 * @param {String} event
 * @return {Array} events
 */
EventEmitter.prototype.eventObjectize = function(eventStr) {

  if (eventStr.charAt(eventStr.length - 1) === '.') {
    eventStr = eventStr.substring(0, eventStr.length - 1);
  }

  var args = eventStr.split('.');

  if (args.length == 1) {
    return args;
  }

  var events = args.map(function(needle, index, arr) {
    var ev = arr.slice(0, index);
    ev.push('*');
    return ev.join('.');
  });

  if (args[args.length - 1] !== '*') {
    events.push(eventStr);
  }
  return events;
};
