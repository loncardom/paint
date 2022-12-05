import { io } from "socket.io-client";
import { useState } from "react";
import './App.css';


function App() {
  let socket;
  function initConnection() {
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
    socket.on('message', 
      function(e) {
        console.log(e);
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

  const [isLoading, setIsLoading] = useState(false)
  const [dim, setDim] = useState(() => 250)

  initConnection();
  return (
    <div className="App">
      <body>
        <h1>Online Paint</h1>
        
        {isLoading && <h2> LOADING CANVAS... PLEASE WAIT</h2>}
        <canvas 
        id="canvas" 
        width="250" 
        height="250" 
        onClick={onClickCanvas}
        ></canvas>
        <div id="game">
        <button className="color" data-name="A" style={{backgroundColor: "rgb(0,0,0)"}}/>
        <button className="color" data-name="A" style={{backgroundColor: "rgb(128,128,128)"}}/>
        <button className="color" data-name="A" style={{backgroundColor: "rgb(192,192,192)"}}/>
          {/* 
          <button class="color" data-name="D" style="background-color: rgb(128, 0, 0); height: 30px; width: 30px;"></button>
          <button class="color" data-name="E" style="background-color: rgb(255, 0, 0); height: 30px; width: 30px;"></button>
          <button class="color" data-name="F" style="background-color: rgb(128, 128, 0); height: 30px; width: 30px;"></button>
          <button class="color" data-name="G" style="background-color: rgb(255, 255, 0); height: 30px; width: 30px;"></button>
          <button class="color" data-name="H" style="background-color: rgb(0, 128, 0); height: 30px; width: 30px;"></button>
          <button class="color" data-name="I" style="background-color: rgb(0, 255, 0); height: 30px; width: 30px;"></button>
          <button class="color" data-name="J" style="background-color: rgb(0, 128, 128); height: 30px; width: 30px;"></button>
          <button class="color" data-name="K" style="background-color: rgb(0, 255, 255); height: 30px; width: 30px;"></button>
          <button class="color" data-name="L" style="background-color: rgb(0, 0, 128); height: 30px; width: 30px;"></button>
          <button class="color" data-name="M" style="background-color: rgb(0, 0, 255); height: 30px; width: 30px;"></button>
          <button class="color" data-name="N" style="background-color: rgb(128, 0, 128); height: 30px; width: 30px;"></button>
          <button class="color" data-name="O" style="background-color: rgb(255, 0, 255); height: 30px; width: 30px;"></button>
          <button class="color" data-name="P" style="background-color: rgb(255, 255, 255); height: 30px; width: 30px;"></button> */}
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
