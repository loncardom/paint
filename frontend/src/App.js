import { io } from "socket.io-client";
import React from "react";
import "./App.scss";
import Paint from "./Paint.js";

// initialize the socket
function initConnection() {
  let socket;
  socket = io(window.location.href, {
    transports: ["websocket", "polling", "flashsocket"]
  });

  socket.on("open", 
    function(event) {
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

export default function App() {
  let socket = initConnection();

  if (!socket) return;
  return (
    <Paint socket={socket}/>
  );
}
