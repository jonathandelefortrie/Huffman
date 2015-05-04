!function(window){

	'use strict';

	var socket = io.connect('http://localhost');

	var width = window.innerWidth;
	var height = window.innerHeight;

	var image, interval, config = { video: true, audio: true };

	var URL = window.URL ||
	    window.webkitURL ||
	        window.msURL ||
	           window.oURL;

	navigator.getUserMedia = navigator.getUserMedia ||
	                   navigator.webkitGetUserMedia ||
	                      navigator.mozGetUserMedia ||
	                         navigator.msGetUserMedia;

	window.AudioContext = window.AudioContext || window.webkitAudioContext;

	var container = document.getElementById("container");
	var canvas = document.createElement("canvas");
	var video = document.createElement('video');
	var img = document.createElement('img');
	var log = document.createElement('p');

	var sourceAudio, audioContext = new AudioContext,
		sourceVideo, videoContext = canvas.getContext('2d');

	canvas.width = video.width = 320;
	canvas.height = video.height = 240;

	container.appendChild(video);
	container.appendChild(img);
	container.appendChild(log);

	if (navigator.getUserMedia)
		navigator.getUserMedia(config,

			function(stream) {

				window.stream = stream;
				video.src = URL.createObjectURL(stream);
				video.addEventListener("loadeddata", function(e){

					console.log('Adding local stream...');

					//sourceAudio = audioContext.createMediaStreamSource(stream);
					//sourceAudio.connect(audioContext.destination);

					draw(e);

				});
				video.play();

			}, function(error) {console.log("An error occurred: [CODE " + error.code + "]");}
		);
	else console.log("Native web camera streaming is not supported in this browser!");

	var draw = function(e) {

		if(interval) clearInterval(interval);
		interval = setInterval(function(){

			videoContext.drawImage(video, 0, 0, 320, 240);
        	image = canvas.toDataURL('image/jpeg', 0.1);
        	//image = videoContext.getImageData(0,0,320,240);

        	var encode = HuffmanEncode(image);
			socket.emit('stream', encode);

		},60);
	}

	var dataURItoBlob = function (dataURI) {

		var byteString = atob(dataURI.split(',')[1]);
		var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
		var array = [];
		
		for(var i = 0; i < byteString.length; i++) array.push(byteString.charCodeAt(i));
		return new Blob([new Uint8Array(array)], {type: mimeString});
	}

}(window);