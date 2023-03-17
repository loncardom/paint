import React, { useState } from "react";
import "./App.scss";
import {getPointsBetweenTwoPoints, getRGB, debounce} from "./utils.js";

let isMouseDown = false;
export default function Paint({socket}) {
  let prevX = -1, prevY = -1;
  let debouncedSetBoardState = debounce({
    func: () => {
      const context = document.getElementById("canvas").getContext("2d", {willReadFrequently: true});
      setBoardState(context.getImageData(0,0,dim.x,dim.y, {willReadFrequently: true}));
    },
    wait: 50
  });
  
  // clear board
  socket.on("clear", function() {
    const context = document.getElementById("canvas").getContext("2d");

    // fill colour with default colour
    context.fillStyle =  getRGB("O");
    context.fillRect(0, 0, dim.x, dim.y);
  });

  // draw a dot
  socket.on("message", function(e) {
    const context = document.getElementById("canvas").getContext("2d");

    // on initial message from server
    if(e.x === -1 && e.y === -1){
      // server sets dimensions
      setDim(e.dim);
      document.getElementById("canvas").width = dim.x;
      document.getElementById("canvas").height = dim.y;

      // save the state of the board
      let imgData = context.createImageData(e.dim.x, e.dim.y);

      // fill colour with default colour
      for(let i = 0; i < e.color.length; i++){
        const color = getRGB(e.color.charAt(i));
        imgData.data[(4 * i)] = parseInt(color.substring(1, 3), 16);
        imgData.data[(4 * i) + 1] = parseInt(color.substring(3, 5), 16);
        imgData.data[(4 * i) + 2] = parseInt(color.substring(5, 7), 16);
        imgData.data[(4 * i) + 3] = 255;
        context.fillStyle =  getRGB(e.color.charAt(i));
        context.fillRect(i % dim.x, i / dim.y, 1, 1);
      }
      setBoardState(imgData);

      // remove loading sign
      setIsLoading(false);
    } else {
      // update single point
      context.fillStyle = getRGB(e.color);
      context.fillRect(e.x, e.y, 1, 1);
      debouncedSetBoardState();
      // const i = e.y * dim.y + e.x;
      // boardState.data[(4 * i)] = parseInt(color.substring(1, 3), 16);
      // boardState.data[(4 * i) + 1] = parseInt(color.substring(3, 5), 16);
      // boardState.data[(4 * i) + 2] = parseInt(color.substring(5, 7), 16);
      // boardState.data[(4 * i) + 3] = 255;
      // setBoardState(boardState);
    }
  });

  // render another users mouse
  socket.on("mouse", function(e){
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


  // preview what the line would look like if the user released the mouse
  function previewLine(x1, y1, x2, y2, color) {
    console.log(x1,x2, y1,y2);
    if (x1 === -1 || y1 === -1) {
      return;
    }

    var canvas = document.getElementById("canvas");
    var context = canvas?.getContext?.("2d");

    if (context) {
      redrawCanvas();
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    }
  }

  
  function drawLine(x1, y1, x2, y2, color) {
    if (x1 === -1 || y1 === -1) {
      socket.emit("message", {x2, y2, color});
      return;
    }

    const line = getPointsBetweenTwoPoints(x1, y1, x2, y2);

    socket.emit("line", {line: JSON.stringify(line), color});
  }

  function clearCanvas() {
    if (!isLoading) {
      socket.emit("clear");
    }
  }

  function redrawCanvas() {
    var canvas = document.getElementById("canvas");
    var context = canvas?.getContext?.("2d");
    context.putImageData(boardState, 0,0);
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
      if (tool === "line") {
        const rect = event.target.getBoundingClientRect();
        const x = Math.round(event.pageX - rect.left);
        const y = Math.round(event.pageY - rect.top);
        prevX = x;
        prevY = y;
      }
    }
  }

  function onMouseUpCanvas(event) {
    const rect = event.target.getBoundingClientRect();
    const x = Math.round(event.pageX - rect.left);
    const y = Math.round(event.pageY - rect.top);
    if (!isLoading) {
      isMouseDown = false;
    }
    if (tool === "line") {
      redrawCanvas();
      drawLine(prevX, prevY, x, y, color);
    }
    prevX = -1;
    prevY = -1;
  }

  function onMouseMoveCanvas(event) {
    const rect = event.target.getBoundingClientRect();
    const x = Math.round(event.pageX - rect.left);
    const y = Math.round(event.pageY - rect.top);
    if (!isLoading && isMouseDown) {
      if (tool === "pencil") {
        drawLine(prevX, prevY, x, y, color);
        prevX = x;
        prevY = y;
      }
      else if (tool === "line") {
        previewLine(prevX, prevY, x, y, color);
      }
    }
    socket.emit("mouse", {x, y});
  }

  const [isLoading, setIsLoading] = useState(false);
  const [dim, setDim] = useState(() => ({x:500, y:500}));
  const [boardState, setBoardState] = useState();

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("A");
  // const [img, setImg] = useState();

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
              <div className={tool === "pencil" ? "selected pencil" : "pencil"} onClick={() => setTool("pencil")}></div>
              <div></div>
              <div></div>
              <div></div>
              <div className={tool === "line" ? "selected line" : "line"} onClick={() => setTool("line")}></div>
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
        <button onClick={clearCanvas}>
          clear
        </button>
        <button>
          <input type="file"
            id="avatar" name="avatar"
            accept="image/png, image/jpeg"
            onChange={(e) => {

              function draw() {
                var canvas = document.getElementById("canvas");
                // canvas.width = this.width;
                // canvas.height = this.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0,0);
              }

              function failed() {
                console.error("The provided file couldn't be loaded as an Image media");
              }
              // console.log(e);
              // setImg();
              var img = new Image();
              img.onload = draw;
              img.onerror = failed;
              img.src = URL.createObjectURL(e.target.files[0]);
              // setImg(img);
            }}
          >
          </input>
          open
        </button>
      </body>
    </div>
  );
}

