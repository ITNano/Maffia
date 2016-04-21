var server = require('./Server');
var messageHandler = require('./Messaging');

var port = (process.argv.length>2?parseInt(process.argv[2]):3000);

messageHandler.setupMessaging(server);
server.startServer(port);
