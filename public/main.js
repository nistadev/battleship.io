'use strict';

(function() {
  var socket = io();
  let missatgeNoMostrat;
  let gameFull;
  let jugador;
  let enemic;
  let vaixellColocantse = null;
  let game = { started: false };
  let chat;

  class Ship extends HTMLElement {
    constructor() {
      super();
      this.addEventListener("click", this.canviaEstat);
    }
  
    set estat(newStatus) {
      this.setAttribute("data-status", newStatus);
      this.status = newStatus;
    }
  
    set longitud(newWidth) {
      this.long = newWidth;
      this.setAttribute("data-width", newWidth);
      this.lives = newWidth;
    }
  
    setPosition(x, y) {
      this.x = x;
      this.y = y;
      this.setAttribute("data-status","posat");
      this.status = "posat";
    }
  
    canviaEstat(){
      if(this.status === "no-posat"){
        
        this.setAttribute("data-status", "posant");
        this.status = "posant";
        
        this.setAttribute("data-orientation", "horizontal");
        this.orientation = "h";
        
        jugador.ships.forEach((ship) => {
          if(!(this === ship)){
            if(ship.status !== "posat"){
              ship.resetStatus();
            }
          }
        });
  
        vaixellColocantse = this;
  
      } else if(this.status === "posant"){
  
        this.setAttribute("data-status", "no-posat");
        this.status = "no-posat";
        
        vaixellColocantse = null;
  
      } else if(this.status === "posat" && !game.started){
        
        this.setAttribute("data-status", "posant");
        this.status = "posant";
      
      } else {
        return;
      }
    }
  
    canviaOrientacio(){
      if(this.orientation == "h"){
        this.setAttribute("data-orientation", "vertical");
        this.orientation = "v";
      } else if(this.orientation == "v"){
        this.setAttribute("data-orientation", "diagonal-right");
        this.orientation = "dr";
      } else if(this.orientation == "dr"){
        this.setAttribute("data-orientation", "diagonal-left");
        this.orientation = "dl";
      } else if(this.orientation == "dl"){
        this.setAttribute("data-orientation", "horizontal");
        this.orientation = "h";
      }
    }
  
    resetStatus(){
      this.setAttribute("data-status","no-posat");
      this.setAttribute("data-orientation","null");
      this.orientation = null;
      this.status = "no-posat";
      this.style.position = "relative";
      this.style.left = "0px";
      this.style.top = "0px";
    }
  
    changePosition(){
      this.setAttribute("data-status","posant");
      this.status = "posant";
      vaixellColocantse = this;
      if(this.orientation == "h"){
        for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
          jugador.board.cells[this.y][this.x + nrSiblingCell].ship = null;
          jugador.board.cells[this.y][this.x + nrSiblingCell].estat = "buit";
        }
      } else if(this.orientation == "v"){
        for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
          jugador.board.cells[this.y + nrSiblingCell][this.x].ship = null;
          jugador.board.cells[this.y + nrSiblingCell][this.x].estat = "buit";
        }
      } else if(this.orientation == "dr"){
        for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
          jugador.board.cells[this.y + nrSiblingCell][this.x + nrSiblingCell].ship = null;
          jugador.board.cells[this.y + nrSiblingCell][this.x + nrSiblingCell].estat = "buit";
        }
      } else if(this.orientation == "dl"){
        for(let nrSiblingCell = 0; nrSiblingCell < this.long; nrSiblingCell++){
          jugador.board.cells[this.y + nrSiblingCell][this.x - nrSiblingCell].ship = null;
          jugador.board.cells[this.y + nrSiblingCell][this.x - nrSiblingCell].estat = "buit";
        }
      }
    }
  }

  class Cell extends HTMLElement {
    constructor(){
      super();
      this.addEventListener("click", this.fesAccio);
    }
  
    fesAccio(){
      if(!game.started){
        //Return if it is not our board
        if(this.fromAttackBoard) return;
        //Joc no comensat, posant vaixells
  
        //Si no en tenim cap posant-se i el volem cambiar de posicio
        if(vaixellColocantse === null) {
          if(!this.ship || jugador.ready) return;
          this.ship.changePosition();
          this.estat = "buit";
          return;
        }
  
        //If ship fits and not collide, assign position and paint cells, also check if all ships have been placed
        if(!checkCollision(this, vaixellColocantse.long, vaixellColocantse.orientation)){
          vaixellColocantse.setPosition(this.x, this.y);
  
          changeCellColor(vaixellColocantse, "vaixell");

          vaixellColocantse = null;
  
          let totsPosats = true;
  
          jugador.ships.forEach((ship) => {
            if(ship.status !== "posat")
              totsPosats = false;
          });
  
          if(totsPosats) 
            jugador.board.parentElement.lastElementChild.style.display = "block";
          else 
            jugador.board.parentElement.lastElementChild.style.display = "none";
        }
        
      } else if(game.started && !game.myTurn){
        //Joc comensat i no es el seu torn, tornem
        if(!this.fromAttackBoard) return;
        return console.log("No es el teu torn.");
      } else {
        //Atacar
        if(!this.fromAttackBoard || this.status != "buit") return;

        socket.emit("attackCell", { x : this.x, y : this.y });
        
        return console.log("Atacant casella: ", this.x, this.y);
      }
    }
  
    set estat(newStatus){
      this.setAttribute("data-status", newStatus);
      this.status = newStatus;
    }
  
  }

  class Board extends HTMLElement {
    constructor(){
      super();
      this.size = 8;
      this.cells = [];
    }
  
    init(attackBoard = false){
      
      let contenidorTaulell;
      this.attackBoard = attackBoard;
      
      if(this.attackBoard)
        this.enemyReady = false;
      
      for (let row = 0; row < this.size; row++) {
        this.cells[row] = [];
        for (let column = 0; column < this.size; column++) {
          let cell = document.createElement("casella-taulell");
          cell.x = column;
          cell.y = row;
          cell.ship = null;
          cell.estat = "buit";
          if(this.attackBoard) cell.fromAttackBoard = true;
          this.appendChild(cell);
          this.cells[row][column] = cell;
        }
      }
  
      if(!this.attackBoard){
        contenidorTaulell = document.createElement("div");
        contenidorTaulell.className = "taulell-i-vaixells";
        contenidorTaulell.appendChild(this);
      } else {
        contenidorTaulell = this;
      }
      
      // Despres de popular els taulells, els posem al document
      let container = document.getElementById("container");
      container.insertBefore(contenidorTaulell, container.firstChild);
    }

    set enemyReady(status){
      this.ready = status;
      this.setAttribute("data-enemy-ready", status);
    }
  
  }

  class Player {
    constructor(name){
      this.name = name;
      this.init();
    }
  
    init(){
      //Ready to play, false until player puts all his ships in the board and hit ready
      this.ready = false;
  
      //This is your board
      this.board = document.createElement("taulell-jugador");
      this.board.init();
      
      //The board you'll attack your enemy
      this.attackBoard = document.createElement("taulell-jugador");
      this.attackBoard.init(true);
      
      //Your ships
      this.ships = [
        document.createElement("vaixell-jugador"),
        document.createElement("vaixell-jugador"),
        document.createElement("vaixell-jugador"),
        //document.createElement("vaixell-jugador")
      ];
  
      this.contenidorVaixells = document.createElement("div");
      this.contenidorVaixells.id = "vaixells-a-posar";
      this.readyButton = document.createElement("button");
      this.readyButton.innerText = "I'm ready!";
      this.readyButton.style.display = "none";
      this.readyButton.id = "ready-button";
  
      this.readyButton.addEventListener("click", () => {
        
        if(!game.enemy) return console.log("Esperant que un altre jugador entri a la partida...");

        console.log("Apunt per comensar!");
        socket.emit("readyToPlay");
        this.ready = true;
        this.readyButton.remove();

      });
  
      this.ships.forEach((ship, index) => {

        ship.x = null;
        ship.y = null;
        ship.orientation = "h";
        ship.estat = "no-posat";
        
        if(index == 0 || index == 3)
          ship.longitud = 3;
  
        else if (index == 1)
          ship.longitud = 4;          
  
        else 
          ship.longitud = 2;
  
        this.contenidorVaixells.appendChild(ship);
  
      });
  
      this.board.parentElement.appendChild(this.contenidorVaixells);
      this.board.parentElement.appendChild(this.readyButton);
  
    }
  }


  class Chat {
    constructor(){
      this.chatContainer = document.createElement("div");
      this.chatContainer.id = "chat";
      this.chatArea = document.createElement("div");
      this.chatArea.id = "chat-messages";
      this.chatControls = document.createElement("div");
      this.chatControls.id = "chat-controls";
      this.messageSendArea = document.createElement("textarea");
      this.sendButton  = document.createElement("button");
      this.sendButton.innerText = "Send";
      this.sendButton.addEventListener("click", sendMessage);

      this.chatControls.appendChild(this.messageSendArea);
      this.chatControls.appendChild(this.sendButton);

      this.chatContainer.appendChild(this.chatArea);
      this.chatContainer.appendChild(this.chatControls);

      document.body.appendChild(this.chatContainer);
    }

    sendMessage(message){
      socket.emit("chatMessage", [jugador.name, message]);
    }

    printMessage(data){
      let messageBody = document.createElement("p");
      
      let username = document.createElement("small");
      username.className = "username";
      username.innerText = data[0] + ": ";

      let messageText = document.createElement("span");
      let htmlMessage = document.createTextNode(data[1]);
      messageText.appendChild(htmlMessage);

      messageBody.appendChild(username);
      messageBody.appendChild(messageText);

      chat.chatArea.appendChild(messageBody);
      chat.chatArea.scrollTop += 10000;
    }



  }







  // Custom elements definitions
  customElements.define('casella-taulell', Cell);
  customElements.define('taulell-jugador', Board);
  customElements.define('vaixell-jugador', Ship);


  window.addEventListener("mousemove", function(e){
    if(vaixellColocantse === null) return;

    vaixellColocantse.style.position = "fixed";
    vaixellColocantse.style.left = e.clientX + "px";
    vaixellColocantse.style.top = e.clientY + "px";

  });

  window.addEventListener("keydown", (e) => {
    if(vaixellColocantse === null && !chat) return;
    
    if(e.keyCode == 27){
      vaixellColocantse.resetStatus()
      vaixellColocantse = null;
    }

    if(e.keyCode == 13)
      sendMessage();

  });

  window.oncontextmenu = function () {
    if(vaixellColocantse === null) return;
    
    vaixellColocantse.canviaOrientacio();

    return false;
  }



  // Socket.io events
  socket.on("fullRoom", fullRoom);
  socket.on("newPlayer", newPlayer);
  socket.on("waitingForPlayer", waitingForPlayer);
  socket.on("newPlayerConnected", newPlayerConnected);
  socket.on("readyToPlay", enemyReady);
  socket.on("startGame", startGame);
  socket.on("youAreNotAlone", ()=> game.enemy = true);
  socket.on("checkTurn", checkIfMyTurn);
  socket.on("cellStatus", cellStatus);
  socket.on("attackCell", changeCellStatus);
  socket.on("youWon", endOfGame);
  socket.on("youLoose", endOfGame);


  // Estats / Funcions
  function newPlayer(){
    let nom = prompt("Nom:");
    jugador = new Player(nom);
    
    chat = new Chat();
    socket.on("chatMessage", chat.printMessage);
    
    console.log("Benvingut " + jugador.name + "!");
    
    missatgeNoMostrat = true;
    waitingForPlayer(false);
  }

  function newPlayerConnected(){
    console.log("Un nou jugador s'ha unit a la partida!");
    game.enemy = true;
  }

  function waitingForPlayer(calEsperar){
    socket.emit("waitingForPlayer");
    if(calEsperar && missatgeNoMostrat){
      console.log("Esperant jugadors...");
      missatgeNoMostrat = false;
    }
  }

  function enemyReady(enemyPlayer){
    if(jugador.ready){
      game.myTurn = true;
    } else {
      game.myTurn = false;
    }

    jugador.attackBoard.enemyReady = true;
    
  }

  function startGame(){
    game.started = true;
    console.log("All players ready... starting game!");
  }

  function fullRoom(isFull){
    gameFull = isFull;
    alert("Game full!");
  }

  function checkCollision(casella, llargadaVaixell, orientacio){
    
    //Checks collision with other ships or if ship is outside the board
    if(orientacio == "h"){
      
      if(casella.x + llargadaVaixell > jugador.board.size)
        return true;
      
      for(let nrSiblingCell = 0; nrSiblingCell < llargadaVaixell; nrSiblingCell++)
        if(jugador.board.cells[casella.y][casella.x + nrSiblingCell].vaixell) return true;

    } else if(orientacio == "v"){
      
      if(casella.y + llargadaVaixell > jugador.board.size)
        return true;

      for(let nrSiblingCell = 0; nrSiblingCell < llargadaVaixell; nrSiblingCell++)
        if(jugador.board.cells[casella.y + nrSiblingCell][casella.x].vaixell) return true;

    } else if(orientacio == "dr"){
      
      if(casella.x + llargadaVaixell > jugador.board.size ||
         casella.y + llargadaVaixell > jugador.board.size)
          return true;

      for(let nrSiblingCell = 0; nrSiblingCell < llargadaVaixell; nrSiblingCell++)
        if(jugador.board.cells[casella.y + nrSiblingCell][casella.x + nrSiblingCell].vaixell) return true;
        
    } else if(orientacio == "dl"){
      
      if(casella.x - llargadaVaixell + 1 < 0 ||
         casella.y + llargadaVaixell > jugador.board.size)
          return true;

      for(let nrSiblingCell = 0; nrSiblingCell < llargadaVaixell; nrSiblingCell++)
        if(jugador.board.cells[casella.y + nrSiblingCell][casella.x - nrSiblingCell].vaixell) return true;
        
    }

    return false;

  }

  function changeCellColor(ship, status){
    if(ship.orientation == "h"){
      
      for(let nrSiblingCell = 0; nrSiblingCell < ship.long; nrSiblingCell++){
        jugador.board.cells[ship.y][ship.x + nrSiblingCell].ship = ship;
        jugador.board.cells[ship.y][ship.x + nrSiblingCell].estat = status;
      }

    } else if(ship.orientation == "v"){

      for(let nrSiblingCell = 0; nrSiblingCell < ship.long; nrSiblingCell++){
        jugador.board.cells[ship.y + nrSiblingCell][ship.x].ship = ship;
        jugador.board.cells[ship.y + nrSiblingCell][ship.x].estat = status;
      }

    } else if(ship.orientation == "dr"){
          
      for(let nrSiblingCell = 0; nrSiblingCell < ship.long; nrSiblingCell++){
        jugador.board.cells[ship.y + nrSiblingCell][ship.x + nrSiblingCell].ship = ship;
        jugador.board.cells[ship.y + nrSiblingCell][ship.x + nrSiblingCell].estat = status;
      }

    } else if(ship.orientation == "dl"){

      for(let nrSiblingCell = 0; nrSiblingCell < ship.long; nrSiblingCell++){
        jugador.board.cells[ship.y + nrSiblingCell][ship.x - nrSiblingCell].ship = ship;
        jugador.board.cells[ship.y + nrSiblingCell][ship.x - nrSiblingCell].estat = status;
      }
      
    }
  }

  function checkIfMyTurn(myTurn){
    game.myTurn = myTurn;
    if(myTurn)
      console.log("Es el teu torn.");
    else
      console.log("Torn de l'adversari.");
  }

  function cellStatus(cell){
    if(jugador.board.cells[cell.y][cell.x].ship){
      
      jugador.board.cells[cell.y][cell.x].ship.lives--;

      if(jugador.board.cells[cell.y][cell.x].ship.lives === 0){
        
        changeCellColor(jugador.board.cells[cell.y][cell.x].ship, "enfonsat");
        jugador.ships.splice(jugador.ships.indexOf(jugador.board.cells[cell.y][cell.x].ship), 1);

        if(jugador.ships.length === 0){
          socket.emit("cellStatus", [cell, "enfonsat"]);
          return socket.emit("gameOver");
        } else {
          return socket.emit("cellStatus", [cell, "enfonsat"]);
        }
      
      } else {
        jugador.board.cells[cell.y][cell.x].estat = "tocat";
        return socket.emit("cellStatus", [cell, jugador.board.cells[cell.y][cell.x].status]);
      }
      
    } else
      socket.emit("cellStatus", [cell, jugador.board.cells[cell.y][cell.x].status]);
    
    jugador.board.cells[cell.y][cell.x].estat = "atacat-enemic";
  }

  function changeCellStatus(response){
    if(response[1] === "buit") {
      jugador.attackBoard.cells[response[0].y][response[0].x].estat = "aigua";
      console.log("Aigua...");
    } 
    else {
      jugador.attackBoard.cells[response[0].y][response[0].x].estat = response[1];

      if(response[1] === "tocat")
        console.log("Tocat!");
      else 
        console.log("Tocat i enfonsat!!!");
    } 
    
    return socket.emit("changeTurn");
  }

  function endOfGame(winner){
    if(winner) console.log("You won! :)");
    else console.log("You loose... :(");

    game.started = false;

  }

  function sendMessage(){
    if(chat.messageSendArea.value.trim() != "")
        chat.sendMessage(chat.messageSendArea.value);
    
    chat.messageSendArea.value = "";
  }

  // window.onbeforeunload = function(){
  //   return "Estas segur de que vols sortir? S'acabarà la partida!"
  // };

})();