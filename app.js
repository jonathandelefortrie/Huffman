var debug = require('debug')('kleep-huffman');
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/stream', function(req, res) {

	var readableStream = fs.createReadStream('public/stream.txt');

    //app.set('watchingFile', true)
	 
	//readableStream.setEncoding('utf8');
	
	// readableStream.on('data', function(data) {
	// 	console.log(data);
	// });

	// readableStream.pipe(res);
	
	// readableStream.on('end', function(data) {
	//     console.log(data);
	// });

});

var clients = new Array();
var writeFile = fs.createWriteStream('stream.txt');

io.sockets.on('connection', function (socket) {

	clients.push(socket);

	socket.on('connect', function (config) {

	    console.log('Connected',socket.id);
	});

	socket.on('disconnect', function () {

		var index = clients.indexOf(socket);
		delete clients[index];
       	clients.splice(index,1);

        console.log('Disconnected',socket.id);
	});

	socket.on('stream', function (data) {

		var huffman = HuffmanDecode(data);
		var base64 = huffman.substr(huffman.indexOf(',') + 1);
		var buffer = new Buffer(base64, 'base64');

		fs.writeFile('public/stream.txt', buffer.toString('binary'), 'binary');

		// fs.writeFile('public/stream.txt', data);
		
		// writeFile.write(buffer.toString('binary'));
	});

	
});

function HuffmanDecode(encode) {

    var pos = 0;
    var decoded = "";
    var decoding = {};

    for (var ch in encode.encoding) 
        decoding[encode.encoding[ch]] = ch;

    while (pos < encode.encoded.length) {
        var key = "";
        while (!(key in decoding)) {
            key += encode.encoded[pos];
            pos++;
        }
        decoded += decoding[key];
    }
    return decoded;
}

server.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});