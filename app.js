var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectedClients = {};
var targetPosition = {x:300, y:300};

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use('/assets', express.static(__dirname + '/assets'));

http.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP, function() {
//http.listen(8080, function() {
	console.log('listening on: ' + process.env.OPENSHIFT_NODEJS_IP + ":" + process.env.OPENSHIFT_NODEJS_PORT);
});

io.on('connection', function(socket) {

	var entityData = {x:50, y:50, destination_x:50, destination_y:50, score:0};
	var clientIndex = socket.id
	entityData.index = clientIndex;

	console.log('------------------------------------------');
	console.log('A user connected. Socket id: ' + socket.id);
	console.log('------------------------------------------');

	connectedClients[clientIndex] = entityData;

	initConnection(socket, io, clientIndex);

	io.to(socket.id).emit('server_initial_update', {clients:connectedClients, client_id:clientIndex, target:targetPosition}); // send all players info to current player, the new player is last
	socket.broadcast.emit('server_update_new_player', entityData); // notify all others
});

function initConnection(socket, io, clientIndex) {

	socket.on('disconnect', function() {

		console.log('------------------------------------------');
		console.log('A user disconnected; Socket id: ' + socket.id);
		console.log('------------------------------------------');

		delete connectedClients[clientIndex];

		io.emit('server_update_disconnect_player', {index: clientIndex});
	});

	socket.on('client_update', function(clientData) {

		console.log('------------------------------------------');
		console.log('Recevied client update (index ' + clientIndex + '):');
		console.log(clientData);
		console.log('------------------------------------------');

		clientData.index = clientIndex;
		connectedClients[clientIndex] = clientData;

		io.emit('server_update', clientData);
	});

	socket.on('client_score_update', function(clientData) {

		console.log('------------------------------------------');
		console.log('Recevied client score update (index ' + clientIndex + '):');
		console.log('------------------------------------------');

		connectedClients[clientIndex].score++;

		targetPosition.x = Math.random() * 400 + 20;
		targetPosition.y = Math.random() * 400 + 20;

		io.emit('server_target_update', targetPosition);
		io.emit('server_score_update', {index:clientIndex});
	});
}
