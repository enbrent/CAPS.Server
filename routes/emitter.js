var io
  , users = {};
module.exports.init = function(socketio) {
	io = socketio;
	io.on('connection', function(socket) {
		socket.on('register', function(data) {
			console.log('socket register for: ' + data.id);
			if(users[data.id] == null) {
				users[data.id] = [];
			}
			users[data.id].push(socket.id);
			// users[data.id] = socket.id;
		})
	});
}

module.exports.emit = function(arg, data) {
	console.log(data);
	if(users[data.userId]) {
		// var length = users[data.userId].length;
		for(var k = 0; k < users[data.userId].length; k += 1) {
			var to = users[data.userId][k];
			// console.log('inside emit alert: ' + k);
			var connection = io.sockets.connected[to];
			if(!connection) {
				console.log('invalid connection detected, deleting..');
				users[data.userId].splice(k, 1);
				k -= 1;
			} else {
				// io.sockets.connected[to].emit('alert', data.msg);	
				if(arg == 'alert') io.sockets.connected[to].emit('alert', data.msg);
				else if(arg == 'alert-update') io.sockets.connected[to].emit('alert-update', data.msg);
			}
			
		}
	}
}

var emitAlert = function(data) {
	console.log(users[data.userId]);
	console.log('inside emit alert'); 
	// Only emit when there are users connected to it
	if(users[data.userId]) {
		// var length = users[data.userId].length;
		for(var k = 0; k < users[data.userId].length; k += 1) {
			var to = users[data.userId][k];
			// console.log('inside emit alert: ' + k);
			var connection = io.sockets.connected[to];
			if(!connection) {
				console.log('invalid connection detected, deleting..');
				users[data.userId].splice(k, 1);
				k -= 1;
			} else {
				io.sockets.connected[to].emit('alert', data.msg);	
			}
			
		}	
	}
	
}

var emitUpdateAlert = function(data) {

}

var doit = function() {
	console.log('inside doit');
	io.on('connection', function (socket) {
		console.log('inside io.on');
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});	
}

