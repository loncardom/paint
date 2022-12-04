const express = require('express')
const app = express()

// static_files has all of statically returned content
// https://expressjs.com/en/starter/static-files.html
app.use('/', express.static('static_files')); // this directory has files to be returned

const port = 5501
const server = require('http').createServer(app);
server.listen(port, function() {
	console.log('Server listening at port %d', port);
});

const io = require('socket.io')(server);

console.log("a")

// Lower the heartbeat timeout (helps us expire disconnected people faster)
// io.set('heartbeat timeout', 8000);
// io.set('heartbeat interval', 4000);

var numToChar = [
	'P', //white
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'A'  //black
]

var charToNum = {
	P: [0, 0, 0, 0], //P is white because the default whiteboard color is white
	B: [0, 0, 0, 1],
	C: [0, 0, 1, 0],
	D: [0, 0, 1, 1],
	E: [0, 1, 0, 0],
	F: [0, 1, 0, 1],
	G: [0, 1, 1, 0],
	H: [0, 1, 1, 1],
	I: [1, 0, 0, 0],
	J: [1, 0, 0, 1],
	K: [1, 0, 1, 0],
	L: [1, 0, 1, 1],
	M: [1, 1, 0, 0],
	N: [1, 1, 0, 1],
	O: [1, 1, 1, 0],
	A: [1, 1, 1, 1]
}

function isValidSet(o){
	var isValid=false;
	try {
		isValid = 
		Number.isInteger(o.x) && o.x!=null && 0<=o.x && o.x<dim &&
		Number.isInteger(o.y) && o.y!=null && 0<=o.y && o.y<dim && 
		!!charToNum[o.color];
	} catch (err){ 
		isValid=false; 
	} return isValid;
}

const dim = 250; 
let bitBoard = "";
bitBoard = bitBoard.concat("P".repeat(dim*dim)); //set entire board to white

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + 1);
}

function setBitBoard(x, y, color){
	bitBoard = bitBoard.replaceAt((x*dim + y), color);
}

function clearBoard(){
	for(x=0;x<dim;x++){
		for(y=0;y<dim;y++){
			setBitBoard(x, y, 'P');
			// sendChangeToDB({x: x, y: y, color: 'P'});
		}
	}
}

function handlePutRequest(o, message, socket){
	if(isValidSet(o)){
		io.emit('message', message);
		setBitBoard(o.x, o.y, o.color);
		// sendChangeToCache(o);
		// sendChangeToDB(o);
	}
}

io.on('close', function() {
    console.log('disconnected');
});

io.on('connection', function(socket) {
	// heartbeat
	socket.isAlive = true;
	console.log("Sending initial board to client...")
	socket.emit('message', {
		x: -1,
		y: -1,
		color: bitBoard	
	});
	console.log('Done sending initial board...');

	// when we get a message from the client
	socket.on('message', function(message) {
		console.log(message);
		if (message.clearBoard == true){
			clearBoard();
		}
		else {
			handlePutRequest(message, message, socket);
		}
	});
});


// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })