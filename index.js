var server = require('./Server');
var port = (process.argv.length>2?parseInt(process.argv[2]):3000);

var typers = [];
var messages = [];

server.registerOnServerStartAction(function(socket){server.sendMessageToMyself(socket, 'syncMessages', getPreviousMessages());});
server.registerOnSocketMessageAction('disconnect', function(){setTyping(this, false);});
server.registerOnSocketMessageAction('chatmsg', function(msg){server.sendMessageToEveryoneElse(this, 'chatmessage', registerMessage(this, msg));});
server.registerOnSocketMessageAction('istyping', function(isTyping){ setTyping(this, isTyping); });
server.startServer(port);

function registerMessage(user, msg){
	msg = {user:user.nickname, message:msg, time:new Date()};
	messages.push(msg);
	return msg;
}

function getRandomName(){
	name = "";
	for(i = 0; i<10; i++){
		name += String.fromCharCode(97+parseInt(Math.floor(Math.random()*25)));	//Add random small letter
	}
	return name;
}

function getPreviousMessages(){
	return messages;
}

function setTyping(user, isTyping){
	if(isTyping){
		if(typers.indexOf(user) < 0){
			typers.push(user);
		}
	}else if(typers.indexOf(user) >= 0){
		typers.splice(typers.indexOf(user), 1);
	}
	server.sendMessageToAll('istyping', typers.map(function(item){ return item.nickname; }));
}