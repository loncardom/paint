const path = require("path");
const express = require("express");
const app = express();

// static_files has all of statically returned content
// https://expressjs.com/en/starter/static-files.html
app.use("/", express.static(path.join(__dirname, "./frontend/build"))); // this directory has files to be returned

const port = 5501;
const server = require("http").createServer(app);
server.listen(port, function() {
    console.log("Server listening at port %d", port);
});

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 4 bit colour
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
};

let users = {};

function isValidSet(o){
    var isValid = false;
    try {
        isValid = 
            Number.isInteger(o.x) && o.x != null && 0 <= o.x && o.x < dim.x &&
            Number.isInteger(o.y) && o.y != null && 0 <= o.y && o.y < dim.y; 
        // !!charToNum[o.color];
    } catch (err){ 
        isValid = false; 
    } return isValid;
}

const dim = {x: 500, y: 500}; 
let bitBoard = "";
bitBoard = bitBoard.concat("O".repeat(dim.x * dim.y)); //set entire board to white

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + 1);
};

function setBitBoard({x, y, color}){
    bitBoard = bitBoard.replaceAt((y * dim.x + x), color);
}

function clearBoard(){
    bitBoard = "".concat("O".repeat(dim.x * dim.y)); //set entire board to white
    io.emit("clear");
}

function handlePutRequest(message, type){
    if (type == "mouse") {
        io.emit("mouse", message);
    }
    else if(isValidSet(message)){
        io.emit("message", message);
        setBitBoard(message);
        // sendChangeToCache(o);
        // sendChangeToDB(o);
    }
}

io.on("close", function() {
    console.log("disconnected");
});

io.on("connection", function(socket) {
    // heartbeat
    socket.isAlive = true;
    console.log("Sending initial board to client...");
    socket.emit("message", {
        x: -1,
        y: -1,
        color: bitBoard,
        dim
    });
    console.log("Done sending initial board...");

    socket.on("clear", function() {
        clearBoard();
    })

    // when we get a message from the client
    socket.on("message", function(message) {
        handlePutRequest(message);
    });

    // when we get a line from the client
    socket.on("line", function(message) {
        // console.log(message);
        const line = JSON.parse(message.line);
        line.forEach(({x,y}) => handlePutRequest({x, y, color:message.color}));
    });

    // when another mouse moves
    socket.on("mouse", function(mouse) {
        // console.log("mouse", mouse);
        if (!users[socket.id]) {
            users[socket.id] = {
                color: getColor()
            };
        }
        mouse.id = socket.id;
        mouse.color = users[socket.id].color;
        socket.broadcast.emit("mouse", mouse);
    });
});



let colorIdx = -1;
function getColor() {
    colorIdx++;
    return COLORS[colorIdx % (COLORS.length - 1)];
}

const COLORS = [
    "red", 
    "blue", 
    "purple", 
    "green", 
    "#D6D6D6", 
    "#FFF5E7", 
    "#D2B4DE", 
    "#AEC6CF", 
    "#F4BAC0", 
    "#A7FCD8"
];