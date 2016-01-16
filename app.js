var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('a user disconnected');
	});

	socket.on('client', function(clientData) {
		io.emit('update', clientData);
	});
});
