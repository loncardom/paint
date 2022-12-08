import { io } from "socket.io-client";
import { useState } from "react";
import './App.scss';

function initConnection(socket) {
  socket = io("http://localhost:5501", {
    // withCredentials: true,
    // extraHeaders: {
    //   "my-custom-header": "abcd"
    // }
  });

  socket.on('open', 
    function(event) {
      // $('#sendButton').removeAttr('disabled');
      console.log("connected");
    }
  );
  socket.on('close', 
    function(event) {
      alert("closed code:" + event.code + " reason:" +event.reason + " wasClean:"+event.wasClean);
    }
  );
  return socket;
}
function App() {
  let socket;

  if (!socket) {
    socket = initConnection(socket);
  }

  if (!socket) return;
  return (
    <Paint socket={socket}/>
  )
}

function Paint({socket}) {
  let prevX = -1, prevY = -1;

  socket?.on('message', 
    function(e) {
      // console.log(e);
      const context = document.getElementById('canvas').getContext('2d');
      // on initial message from server
      if(e.x == -1 && e.y == -1){
        // server sets dimensions
        setDim(e.dim)
        document.getElementById("canvas").width = dim;
        document.getElementById("canvas").height = dim;

        // fill colour with default colour
        for(let i = 0; i < e.color.length; i++){
          context.fillStyle =  getRGB(e.color.charAt(i));
          context.fillRect(i/dim, i%dim, 1, 1);
        }

        // remove loading sign
        setIsLoading(false);
      } else {
        context.fillStyle = getRGB(e.color);
        context.fillRect(e.x, e.y, 1, 1);
      }
    }
  );

  socket?.on("mouse", function(e){
    console.log(e);
    const context = document.getElementById('canvas').getContext('2d');
    // debugger;
    let existingElement = document.getElementById(e.id)
    if (existingElement) {
      existingElement.style.top = e.y + 'px';
      existingElement.style.left = e.x + 'px';
    } else {
      const newDiv = document.createElement("div");
      const node = document.createTextNode("⬉");
      newDiv.appendChild(node);
      newDiv.setAttribute("id", e.id);
      newDiv.style.position = "absolute";
      newDiv.style.top = e.y + 'px';
      newDiv.style.left = e.x + 'px';
      newDiv.style.marginLeft = "62px";
      newDiv.style.marginTop = "10px";
      newDiv.style.fontSize = "30px";
      newDiv.style.userSelect = "none";
      newDiv.style.color = e.color;
      document.getElementById('canvas').parentElement.appendChild(newDiv)
    }
  })

  
  function drawLine(x1, y1, x2, y2, color) {
    if (x1 === -1 || y1 === -1) {
      socket.emit('message', {x2, y2, color});
      return
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

    socket.emit('line', {line: JSON.stringify(line), color})
  }

  function onClickCanvas(event) {
    if (!isLoading) {
      const rect = event.target.getBoundingClientRect()
      var x=Math.round(event.pageX-rect.left);
      var y=Math.round(event.pageY-rect.top);
      var o = { 
        'x': x, 
        'y': y, 
        'color' : "A"
      };
      socket.emit('message', o);
    }
  }

  function onMouseDownCanvas(event) {
    if (!isLoading) {
      setMouseDown(true)
    }
  }

  function onMouseUpCanvas(event) {
    if (!isLoading) {
      setMouseDown(false)
    }
    prevX = -1;
    prevY = -1;
  }

  function onMouseMoveCanvas(event) {
    const rect = event.target.getBoundingClientRect()
    const x=Math.round(event.pageX-rect.left);
    const y=Math.round(event.pageY-rect.top);
    if (!isLoading && mouseDown) {
      drawLine(prevX, prevY, x, y, "A");
      prevX = x;
      prevY = y;
    }
    socket.emit('mouse', {x, y});
  }

  const [isLoading, setIsLoading] = useState(false)
  const [dim, setDim] = useState(() => 500)
  const [mouseDown, setMouseDown] = useState(false)

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
              width="500" 
              height="500" 
              onClick={onClickCanvas}
              onMouseDown={onMouseDownCanvas}
              onMouseUp={onMouseUpCanvas}
              onMouseMove={onMouseMoveCanvas}
            >
              <div>
                abc
              </div>
              </canvas>
          </div>
        </div>

        <div id="game" className="color-bar">
          <div className="dual-color">

          </div>
          <button className="color" data-name="A" style={{backgroundColor: "rgb(0,0,0)"}}/>
          <button className="color" data-name="B" style={{backgroundColor: "rgb(128,128,128)"}}/>
          <button className="color" data-name="C" style={{backgroundColor: "rgb(192,192,192)"}}/>
          <button className="color" data-name="D" style={{backgroundColor: "rgb(128,0,0)"}}/>
          <button className="color" data-name="E" style={{backgroundColor: "rgb(255, 0, 0)"}}/>
          <button className="color" data-name="F" style={{backgroundColor: "rgb(128, 128, 0)"}}/>
          <button className="color" data-name="G" style={{backgroundColor: "rgb(192,192,192)"}}/>
          <button className="color" data-name="H" style={{backgroundColor: "rgb(0, 128, 0)"}}/>
          <button className="color" data-name="I" style={{backgroundColor: "rgb(0, 255, 0)"}}/>
          <button className="color" data-name="J" style={{backgroundColor: "rgb(0, 128, 128)"}}/>
          <button className="color" data-name="K" style={{backgroundColor: "rgb(0, 255, 255)"}}/>
          <button className="color" data-name="L" style={{backgroundColor: "rgb(0, 0, 128)"}}/>
          <button className="color" data-name="M" style={{backgroundColor: "rgb(0, 0, 255)"}}/>
          <button className="color" data-name="N" style={{backgroundColor: "rgb(128, 0, 128)"}}/>
          <button className="color" data-name="O" style={{backgroundColor: "rgb(255, 0, 255"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
          <button className="color" data-name="P" style={{backgroundColor: "rgb(255, 255, 255)"}}/>
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
    case 'A':
      return 'rgb(0, 0, 0)';			//black
    case 'B':
      return 'rgb(128, 128, 128)';	//gray
    case 'C':
      return 'rgb(192, 192, 192)';	//silver
    case 'D':
      return 'rgb(128, 0, 0)';		//maroon
    case 'E':
      return 'rgb(255, 0, 0)';		//red
    case 'F':
      return 'rgb(128, 128, 0)';		//olive
    case 'G':
      return 'rgb(255, 255, 0)';		//yellow
    case 'H':
      return 'rgb(0, 128, 0)';		//green
    case 'I':
      return 'rgb(0, 255, 0)';		//lime
    case 'J':
      return 'rgb(0, 128, 128)';		//teal
    case 'K':
      return 'rgb(0, 255, 255)';		//aqua
    case 'L':
      return 'rgb(0, 0, 128)';		//navy
    case 'M':
      return 'rgb(0, 0, 255)';		//blue
    case 'N':
      return 'rgb(128, 0, 128)';		//purple
    case 'O':
      return 'rgb(255, 0, 255)';		//fuchsia
    case 'P':
      return 'rgb(255, 255, 255)';	//white
  }
}

export default App;
