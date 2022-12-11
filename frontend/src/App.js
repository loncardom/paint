import { io } from "socket.io-client";
import React, { useState } from "react";
import "./App.scss";

// initialize the socket
function initConnection() {
  let socket;
  socket = io("http://localhost:5501", {
    // withCredentials: true,
    // extraHeaders: {
    //   "my-custom-header": "abcd"
    // }
  });

  socket.on("open", 
    function(event) {
      // $('#sendButton').removeAttr('disabled');
      console.log("connected");
    }
  );
  socket.on("close", 
    function(event) {
      alert("closed code:" + event.code + " reason:" + event.reason + " wasClean:" + event.wasClean);
    }
  );
  return socket;
}


function App() {
  let socket = initConnection();

  if (!socket) return;
  return (
    <Paint socket={socket}/>
  );
}

let isMouseDown = false;
function Paint({socket}) {
  let prevX = -1, prevY = -1;

  socket.on("message", 
    function(e) {
      // console.log(e);
      const context = document.getElementById("canvas").getContext("2d");

      // on initial message from server
      if(e.x === -1 && e.y === -1){
        // server sets dimensions
        setDim(e.dim);
        document.getElementById("canvas").width = dim.x;
        document.getElementById("canvas").height = dim.y;

        // fill colour with default colour
        for(let i = 0; i < e.color.length; i++){
          context.fillStyle =  getRGB(e.color.charAt(i));
          context.fillRect(i / dim.x, i % dim.y, 1, 1);
        }

        // remove loading sign
        setIsLoading(false);
      } else {
        // update single point
        context.fillStyle = getRGB(e.color);
        context.fillRect(e.x, e.y, 1, 1);
      }
    }
  );

  socket.on("mouse", function(e){
    console.log(e);

    let existingElement = document.getElementById(e.id);
    if (existingElement) {
      existingElement.style.top = e.y + "px";
      existingElement.style.left = e.x + "px";
    } else {
      const newDiv = document.createElement("div");
      const node = document.createTextNode("⬉");
      newDiv.appendChild(node);
      newDiv.setAttribute("id", e.id);
      newDiv.classList.add("mouse");
      newDiv.style.top = e.y + "px";
      newDiv.style.left = e.x + "px";
      newDiv.style.marginLeft = "62px";
      newDiv.style.marginTop = "10px";
      newDiv.style.color = e.color;
      document.getElementById("canvas").parentElement.appendChild(newDiv);
    }
  });

  
  function drawLine(x1, y1, x2, y2, color) {
    if (x1 === -1 || y1 === -1) {
      socket.emit("message", {x2, y2, color});
      return;
    }

    const line = [];
    // Create an array to store the points
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);

    // Calculate the error value
    let error = dx - dy;

    // Create a variable to store the direction of the line
    let xstep, ystep;

    // Check which direction the line is going in
    if (x1 < x2) {
      xstep = 1;
    } else {
      xstep = -1;
    }
    if (y1 < y2) {
      ystep = 1;
    } else {
      ystep = -1;
    }

    // Loop through the points on the line
    while (true) {
      // Add the current point to the line
      line.push({x: x1, y: y1});

      // Check if we have reached the end point
      if (x1 === x2 && y1 === y2) {
        break;
      }

      // Calculate the new error value
      const error2 = 2 * error;

      // Check if we need to move in the x or y direction
      if (error2 > -dy) {
        error -= dy;
        x1 += xstep;
      }
      if (error2 < dx) {
        error += dx;
        y1 += ystep;
      }
    }

    socket.emit("line", {line: JSON.stringify(line), color});
  }

  function onClickCanvas(event) {
    if (!isLoading) {
      const rect = event.target.getBoundingClientRect();
      var x = Math.round(event.pageX - rect.left);
      var y = Math.round(event.pageY - rect.top);
      socket.emit("message", {
        x, 
        y, 
        color
      });
    }
  }

  function onMouseDownCanvas(event) {
    if (!isLoading) {
      isMouseDown = true;
    }
  }

  function onMouseUpCanvas(event) {
    if (!isLoading) {
      isMouseDown = false;
    }
    prevX = -1;
    prevY = -1;
  }

  function onMouseMoveCanvas(event) {
    const rect = event.target.getBoundingClientRect();
    const x = Math.round(event.pageX - rect.left);
    const y = Math.round(event.pageY - rect.top);
    if (!isLoading && isMouseDown) {
      drawLine(prevX, prevY, x, y, color);
      prevX = x;
      prevY = y;
    }
    socket.emit("mouse", {x, y});
  }

  const [isLoading, setIsLoading] = useState(false);
  const [dim, setDim] = useState(() => ({x:500, y:500}));
  const [color, setColor] = useState("A");

  return (
    <div className="App">
      <body>
        <div className="toolbar">
          <span><u>F</u>ile</span>
          <span><u>E</u>dit</span>
          <span><u>V</u>iew</span>
          <span><u>I</u>mage</span>
          <span><u>C</u>olors</span>
          <span><u>H</u>elp</span>
          <span>E<u>x</u>tras</span>
        </div>

        <div className="main">
          <div className="paint-tools-container">
            <div className="paint-tools">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="selected"></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div className="canvas-container">
            {isLoading && <h2> LOADING CANVAS... PLEASE WAIT</h2>}
            <canvas 
              id="canvas" 
              width={dim.x}
              height={dim.y}
              onClick={onClickCanvas}
              onMouseDown={onMouseDownCanvas}
              onMouseUp={onMouseUpCanvas}
              onMouseMove={onMouseMoveCanvas}
            />
          </div>
        </div>

        <div id="game" className="color-bar">
          <div className="dual-color">
            <div className="color">
              
            </div>
          </div>
          <button className="color" onClick={()=>setColor("A")} style={{backgroundColor: getRGB("A")}}/>
          <button className="color" onClick={()=>setColor("B")} style={{backgroundColor: getRGB("B")}}/>
          <button className="color" onClick={()=>setColor("C")} style={{backgroundColor: getRGB("C")}}/>
          <button className="color" onClick={()=>setColor("D")} style={{backgroundColor: getRGB("D")}}/>
          <button className="color" onClick={()=>setColor("E")} style={{backgroundColor: getRGB("E")}}/>
          <button className="color" onClick={()=>setColor("F")} style={{backgroundColor: getRGB("F")}}/>
          <button className="color" onClick={()=>setColor("G")} style={{backgroundColor: getRGB("G")}}/>
          <button className="color" onClick={()=>setColor("H")} style={{backgroundColor: getRGB("H")}}/>
          <button className="color" onClick={()=>setColor("I")} style={{backgroundColor: getRGB("I")}}/>
          <button className="color" onClick={()=>setColor("J")} style={{backgroundColor: getRGB("J")}}/>
          <button className="color" onClick={()=>setColor("K")} style={{backgroundColor: getRGB("K")}}/>
          <button className="color" onClick={()=>setColor("L")} style={{backgroundColor: getRGB("L")}}/>
          <button className="color" onClick={()=>setColor("M")} style={{backgroundColor: getRGB("M")}}/>
          <button className="color" onClick={()=>setColor("N")} style={{backgroundColor: getRGB("N")}}/>
          <button className="color" onClick={()=>setColor("O")} style={{backgroundColor: getRGB("O")}}/>
          <button className="color" onClick={()=>setColor("P")} style={{backgroundColor: getRGB("P")}}/>
          <button className="color" onClick={()=>setColor("Q")} style={{backgroundColor: getRGB("Q")}}/>
          <button className="color" onClick={()=>setColor("R")} style={{backgroundColor: getRGB("R")}}/>
          <button className="color" onClick={()=>setColor("S")} style={{backgroundColor: getRGB("S")}}/>
          <button className="color" onClick={()=>setColor("T")} style={{backgroundColor: getRGB("T")}}/>
          <button className="color" onClick={()=>setColor("U")} style={{backgroundColor: getRGB("U")}}/>
          <button className="color" onClick={()=>setColor("V")} style={{backgroundColor: getRGB("V")}}/>
          <button className="color" onClick={()=>setColor("W")} style={{backgroundColor: getRGB("W")}}/>
          <button className="color" onClick={()=>setColor("X")} style={{backgroundColor: getRGB("X")}}/>
          <button className="color" onClick={()=>setColor("Y")} style={{backgroundColor: getRGB("Y")}}/>
          <button className="color" onClick={()=>setColor("2")} style={{backgroundColor: getRGB("2")}}/>
          <button className="color" onClick={()=>setColor("Z")} style={{backgroundColor: getRGB("Z")}}/>
          <button className="color" onClick={()=>setColor("1")} style={{backgroundColor: getRGB("1")}}/>
        </div>
        <form id="clearButton">
          <input type="submit" name="clear" value="clear"/>
        </form>
      </body>
    </div>
  );
}

function getRGB(c) {
  switch (c) {
  default:
  case "A":
    return "#000000";
  case "B":
    return "#808080";
  case "C":
    return "#800000";
  case "D":
    return "#808000";
  case "E":
    return "#008000";
  case "F":
    return "#008080";
  case "G":
    return "#000080";
  case "H":
    return "#800080";
  case "I":
    return "#808040";
  case "J":
    return "#004040";
  case "K":
    return "#0080FF";
  case "L":
    return "#004080";
  case "M":
    return "#4001FF";
  case "N":
    return "#804000";
  // row 2
  case "O":
    return "#FFFFFF";
  case "P":
    return "#C0C0C0";
  case "Q":
    return "#FF0000";
  case "R":
    return "#FFFF04";
  case "S":
    return "#00FF00";
  case "T":
    return "#00FFFF";
  case "U":
    return "#0000FF";
  case "V":
    return "#FF00FF";
  case "W":
    return "#FFFF80";
  case "X":
    return "#00FF80";
  case "Y":
    return "#80FFFF";
  case "Z":
    return "#FF0080";
  case "1":
    return "#FF8040";
  case "2":
    return "#8080FF";
  }
}

export default App;
