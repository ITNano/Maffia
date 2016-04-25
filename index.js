var server = require('./Server');
var messageHandler = require('./Messaging');

var port = (process.argv.length>2?parseInt(process.argv[2]):3000);

process.env.TZ = 'Europe/Stockholm';
console.log(new Date()+" Starting up");
messageHandler.setupMessaging(server);
console.log(new Date()+" Messaging started");
server.startServer(port);
console.log(new Date()+" Starting to listen for friends");
