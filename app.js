var debug = require('debug')('kleep-huffman');
var express = require('express');
var path = require('path');
var fs = require('fs');
var es = require('event-stream');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Middleware
app.use(function(req, res, next) {
  req.io = io;
  next();
});
app.set('watchingFile', true);
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/read/:id', function(req, res) {

	var id = req.params.id;
	var file = 'stream/stream'+id+'.txt';
	var stream = fs.createReadStream(file, {flags: 'r'})
	
	req.io.sockets.on('connection', function(socket) {

		stream.pipe(es.split()).pipe(es.map(function (line, cb) {

		    if(line) {
		    	var data = JSON.parse(line);
		    	socket.emit('read', data);
		    }
		    cb(null, line);
		}));

	});

	res.sendFile(__dirname + '/public/read.html');
	
});

app.get('/write/:id', function(req, res) {

	var id = req.params.id;
	var file = 'stream/stream'+id+'.txt';
	var stream = fs.createWriteStream(file, {flags:'a'});

	// Clean file
	fs.truncate(file, 0);

	req.io.sockets.on('connection', function(socket) {

		socket.on('write', function (data) {

			var line = '';
			var read = fs.readFileSync(file,{ encoding: 'utf-8' });
			var lines = (read) ? read.split('\n') : null;

			if(lines && lines.length >= 10) {
				line = lines.shift();
				fs.writeFile(file, read.substring(line.length,read.length));
			}

			stream.write(JSON.stringify(data) + '\n');
			
		});

	});

	res.sendFile(__dirname + '/public/write.html');

});

/// Streams

var streams = new Array();

io.sockets.on('connection', function (socket) {

	socket.on('add', function () {

		streams.push(socket);
	    console.log('Stream added:', socket.id);
	});

	socket.on('remove', function () {

		var index = streams.indexOf(socket);

		if(index !== -1) {
			delete streams[index];
       		streams.splice(index,1);
       		console.log('Stream removed',socket.id);
		}
	});

});

///

server.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});