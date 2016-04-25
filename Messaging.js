var typers = [];
var messages = [];
var server;

exports.setupMessaging = function(server){
	server.registerOnServerStartAction(function(socket){
		server.sendMessageToMyself(socket, 'syncMessages', getPreviousMessages());
	});
	
	server.registerOnSocketMessageAction('disconnect', function(){
		setTyping(server, this, false);
	});
	server.registerOnSocketMessageAction('chatmsg', function(msg){
		server.sendMessageToEveryoneElse(this, 'chatmessage', registerMessage(this, msg));
	});
	server.registerOnSocketMessageAction('istyping', function(isTyping){
		setTyping(server, this, isTyping);
	});
};

exports.sendMessageToAll = function(server, displayName, messageContent){
	server.sendMessageToAll('servermessage', registerMessage(displayName, messageContent));
};
exports.sendMessageToSomeUsers = function(server, users, displayName, messageContent, isSecret){
	var msg = registerMessage(displayName, messageContent, (isSecret?'secret':undefined));
	const sendMessage = function(user){server.sendMessageToMyself(user, 'servermessage', msg);};
	users.forEach(sendMessage);
};


function registerMessage(user, msg, status){
	msg = {user:user.nickname, message:msg, status:status, time:new Date().getTime()};
	messages.push(msg);
	return msg;
}

function getPreviousMessages(){
	return messages.filter(function(value){return value.status === undefined || value.status !== 'secret';});
}

function setTyping(server, user, isTyping){
	if(isTyping){
		if(typers.indexOf(user) < 0){
			typers.push(user);
		}
	}else if(typers.indexOf(user) >= 0){
		typers.splice(typers.indexOf(user), 1);
	}
	server.sendMessageToAll('istyping', typers.map(function(item){ return item.nickname; }));
}