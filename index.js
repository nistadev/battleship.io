
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  io.playersReady = 0;
  io.of("/").clients((err, clients) => {
    if(err) throw err;

    socket.on('waitingForPlayer', () => {
      if(clients.length != 2){
        socket.emit('waitingForPlayer', true);
      } else {
        socket.broadcast.emit('newPlayerConnected');
        socket.emit("youAreNotAlone");
      }
    });

    socket.on('readyToPlay', () => {
      socket.broadcast.emit('readyToPlay');
      io.playersReady += 1;

      if(io.playersReady == 2){
        socket.broadcast.emit('startGame');
        socket.emit('startGame');
      }
    });

    socket.on('changeTurn', () => {
      socket.broadcast.emit("checkTurn", true);
      socket.emit("checkTurn", false);
    });

    socket.on("attackCell", (cellCoords) => {
      socket.broadcast.emit("cellStatus", cellCoords);
    });

    socket.on("cellStatus", (response) => {
      socket.broadcast.emit("attackCell", response);
    });

    socket.on("gameOver", () => {
      socket.broadcast.emit("youWon", true);
      socket.emit("youLoose", false);
    });
    
    socket.on("chatMessage", (data) => {
      socket.broadcast.emit("chatMessage", data);
      socket.emit("chatMessage", data);
    });

    if(clients.length <= 2){
      socket.emit("newPlayer");
    } else {
      socket.emit("fullRoom");
      socket.disconnect();
    }
  });
}
io.sockets.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
