var typers = [];
var messages = [];

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


function registerMessage(server, user, msg){
	msg = {user:user.nickname, message:msg, time:new Date()};
	messages.push(msg);
	return msg;
}

function getPreviousMessages(){
	return messages;
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