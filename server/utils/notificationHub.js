const { EventEmitter } = require('events');
const hub = new EventEmitter();
hub.setMaxListeners(500);
module.exports = hub;
