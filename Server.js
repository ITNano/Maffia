var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var users = [];
var customActions = [];
var exampleNames = [];
var server;

//Init request responses
app.get('/', function(req, res, next){ res.sendFile(__dirname+'/index.html'); });
app.use('/resources', function (req, res, next) { res.sendFile(__dirname+req.originalUrl); });

//Init array of auto generated names.
fs.readFile('resources/autogeneratednames.txt', 'utf-8', function(err, data){
	if(err){
		console.log("Error while reading the auto generated names filelist");
	}else{
		exampleNames = data.split("\n");
	}
});

//Init all functionality
exports.startServer = function(port){
	io.on('connection', function(socket){
		console.log("Got connection");
		socket.nickname = getRandomName();
		socket.emit('renameUser', '', socket.nickname);
		
		//Notify
		socket.broadcast.emit('connectedUser', socket.nickname);
		users.forEach(function(user){
			socket.emit('connectedUser', user.nickname);
		});
		users.push(socket);
		
		socket.on('disconnect', function(){
			console.log("Disconnecting user")
			socket.broadcast.emit('disconnectedUser', socket.nickname);
			users.splice(users.indexOf(socket), 1);
		});
		
		socket.on('setnick', function(nick){
			console.log("Setting nick "+nick);
			if(nick != socket.nickname){
				if(isNickAvailable(socket, socket.nick)){
					oldName = socket.nickname;
					socket.nickname = nick;
					io.emit('renameUser', oldName, socket.nickname);
				}else{
					socket.emit('actionDenied');
				}
			}else{
				console.log("No action taken...");
			}
		});
		
		const applyCustomAction = function(item){addActionToSocket(socket, item.actionName, item.callback);}
		customActions.forEach(applyCustomAction);
	});
	server = http.listen(port, function(){
		console.log('Listening on *:'+port+" ");
	});
}

exports.isStarted = function(){
	return server !== undefined;
};

exports.registerOnServerStartAction = function(callback){
	io.on('connection', function(socket){callback(socket);});
};

exports.registerOnSocketMessageAction = function(actionName, callback){
	const addAction = function(item){addActionToSocket(item, actionName, callback);}
	users.forEach(addAction);
	customActions.push({actionName:actionName, callback:callback});
};

exports.sendMessageToMyself = function(socket, messageName, data){
	if(this.isStarted()) socket.emit(messageName, data);
	else console.log("Tried to send message before startup! ("+messageName+")");
};
exports.sendMessageToEveryoneElse = function(socket, messageName, data){
	if(this.isStarted()) socket.broadcast.emit(messageName, data);
	else console.log("Tried to send message before startup! ("+messageName+")");
};
exports.sendMessageToAll = function(messageName, data){
	if(this.isStarted()) io.emit(messageName, data);
	else console.log("Trying to send message through unstarted server ("+messageName+")");
};


function getRandomName(){
	randomIndex = parseInt(Math.floor(Math.random()*exampleNames.length));
	i = randomIndex;
	while(i<exampleNames.length && !isNickAvailable(undefined, exampleNames[i])){
		i++;
	}
	if(i < exampleNames.length){
		return exampleNames[randomIndex];
	}else{
		i = randomIndex;
		while(randomIndex>=0 && !isNickAvailable(undefined, exampleNames[i])){
			i--;
		}
		if(i < exampleNames.length){
			return exampleNames[randomIndex];
		}else{
			totallyGeneratedName = "";
			for(i = 0; i<10; i++){
				totallyGeneratedName += String.fromCharCode(97+parseInt(Math.floor(Math.random()*26)));
			}
			return totallyGeneratedName;
		}
	}
}
function isNickAvailable(socket, nick){
	const isAvailable = function(item){return (socket !== undefined && item === socket) || item.nickname !== nick};
	return users.every(isAvailable);
}
function addActionToSocket(socket, actionName, callback){
	if(typeof callback === "function"){
		socket.on(actionName, callback.bind(socket));
	}else{
		console.log("Well, this callback is fked up. "+typeof callback);
	}
}